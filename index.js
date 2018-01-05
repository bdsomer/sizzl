#!/usr/bin/env node

const cwd = process.cwd()

const packageJson = {
	'bugs' : { },
	'repository' : { },
	'scripts'  : { }
}

const config = { }

const { join, basename } = require('path')

const questions = [
	['Description', (val) => packageJson.description = val],
	['Keywords', (val) => packageJson.keywords = val.split(', ')],
	['Author', (val) => packageJson.author = val],
	['GitHub Username', (val) => config.githubUsername = val],
	['Package Name', (val) => {
		packageJson.name = val
		setGithubUsernameTo(val)
	}, basename(cwd)],
	['GitHub Repository Name', (val) => config.githubRepoName = val], // It defaults to whatever the package name was...
	['Version', (val) => packageJson.version = val, '1.0.0'],
	['Entry Point', (val) => packageJson.main = val, 'index.js'],
	['Test Command', (val) => packageJson.scripts.test = val, 'node tests/test.js'],
	['Liscense', (val) => packageJson.license = val, 'MIT']
]

function setGithubUsernameTo(val) {
	questions[5][2] = val
}

const readline = require('readline')
const { promisify } = require('util')
let { writeFile, mkdir } = require('fs')
writeFile = promisify(writeFile)
mkdir = promisify(mkdir)

// Parse the flags, if they exist

if (process.argv[2]) {
	const haveFlag = (flag) => process.argv[2].indexOf(flag) !== -1
	if (haveFlag('h')) {
		console.log(`Available Flags:

h - Displays the help menu and exits the program.

d - Skips questions with default values.

r - Creates a boilerplate README.md file.

l - Creates a LICENSE.md file.

w - Creates a web directory with boilerplate index.html and 404.html files.

t - Creates a tests directory with an empty test.js file.

n - Creates a lib directory with an empty index.js file, intended for writing Node.js.

Examples:

Initialize a workspace with a README.md file, LICENSE.md file, test files, and Node.js boilerplate directory. Skip all defaults.
sizzl rltnd

Initialize a workspace with a Node.js boilerplate directory and boilerplate web application files.
sizzl nw
`)
		process.exit(0)
	}
	var skipDefaults = haveFlag('d')
	var createReadme = haveFlag('r')
	var createLicense = haveFlag('l')
	var webApp = haveFlag('w')
	var createTests = haveFlag('t')
	var createLibDir = haveFlag('n')
}

// Add promisifed support for the readline question method

readline.Interface.prototype.questionPromised = function(query) {
	return new Promise((resolve) => {
		this.question(query, resolve)
	})
}

const rl = readline.createInterface({
	'input' : process.stdin,
	'output' : process.stdout
})

const htmlBoilerplate = `<!DOCTYPE html>
<html>
	<head>
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<title></title>
	</head>
	<body>

	</body>
</html>
`;

/**
 * Main program function.
 */
async function main() {
	for (let i = 0; i < questions.length; i++) {
		// Extract the question and default answer
		let question = questions[i][0]
		const updateScript = questions[i][1]
		const defaultAnswer = questions[i][2]
		
		// Build the question
		if (defaultAnswer) {
			if (skipDefaults) {
				var skip = true
			} else {
				question += ` (${defaultAnswer})`
			}
		}

		if (!skip) {
			question += ' '
			var res = await rl.questionPromised(question)
		}

		if ((res || !defaultAnswer) && !skip) {
			var answer = res
		} else {
			answer = defaultAnswer
		}

		updateScript(answer)
	}

	packageJson.repository.type = 'git'
	const repositoryPath = `https://github.com/${config.githubUsername}/${config.githubRepoName}`
	packageJson.repository.url = `git+${repositoryPath}.git`
	packageJson.bugs.url = `${repositoryPath}/issues`
	packageJson.homepage = `${repositoryPath}#readme`

	const createPath = (filename) => join(cwd, filename)

	await writeFile(createPath('package.json'), JSON.stringify(packageJson, null, '\t'))
	await writeFile(createPath('package-lock.json'), JSON.stringify({
		'name' : packageJson.name,
		'version' : packageJson.version,
		'lockfileVersion' : 1
	}, null, '\t'))

	if (createReadme) {
		await writeFile(createPath('README.md'), `# ${packageJson.name}
> ${packageJson.description}
`)
	}

	if (createLicense) {
		switch (packageJson.license) {
			case 'MIT':
				await writeFile(createPath('LICENSE.md'), `Copyright ${new Date().getFullYear()} ${packageJson.author}

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
`)
			case 'UNLICENSED':
				break
			default:
				console.warn(`\x1b[30m\x1b[43m[WARN]\x1b[0m \x1b[33mWe haven't implemented logic for the ${packageJson.license} license yet. A LICENSE.md file will not be written.\x1b[0m`)
		}
	}

	const dirErrHandler = (err, dirName) => {
		if (err.errno === -17) {
			console.warn('\x1b[30m\x1b[43m[WARN]\x1b[0m \x1b[33mDirectory "' + dirName + '" already exists.\x1b[0m')
		} else {
			console.error('\x1b[30m\x1b[41m[FATAL]\x1b[0m \x1b[31mA fatal error occured:\x1b[0m')
			console.error(err)
			system.exit(-1)
		}
	}

	if (webApp) {
		try {
			await mkdir(createPath('site'))
		} catch (err) {
			dirErrHandler(err, 'site')
		}
		try {
			await mkdir(createPath('site/host'))
		} catch (err) {
			dirErrHandler(err, 'site/host')
		}
		await writeFile(createPath('site/host/index.html'), htmlBoilerplate)
		await writeFile(createPath('site/host/404.html'), htmlBoilerplate)
	}

	const emptyBuffer = Buffer.from([])

	if (createTests) {
		try {
			await mkdir(createPath('tests'))
		} catch (err) {
			dirErrHandler(err, 'tests')
		}
		await writeFile(createPath('tests/test.js'), emptyBuffer)
	}

	if (createLibDir) {
		try {
			await mkdir(createPath('lib'))
		} catch (err) {
			dirErrHandler(err, 'lib')
		}
		await writeFile(createPath('lib/index.js'), emptyBuffer)
	}
}

main().then(() => {
	rl.close()
	console.log('Process complete!')
}).catch((err) => {
	console.error(err)
	process.exit(-1)
})