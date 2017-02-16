'use strict';

const Path = require('path');
const Generators = require('yeoman-generator');
const GithubUrlFromGit = require('github-url-from-git');
const GitConfig = require('git-config');
const Mkdirp = require('mkdirp');


module.exports = Generators.Base.extend({
    constructor: function () {

        Generators.Base.apply(this, arguments);

        this.argument('appName', {
            type: String,
            desc: 'In module format. Ex: `hapi-plot-device`',
            required: true
        });
    },
    init: function () {

        this.pkg = this.fs.readJSON(Path.join(__dirname, '../package.json'));
    },
    git: function () {

        const done = this.async();
        this.gitConfig = {};

        GitConfig((err, config) => {

            if (err) {
                return done();
            }

            this.gitConfig = config;
            done();
        });
    },
    askFor: function () {

        const prompts = [{
            name: 'description',
            message: 'Description'
        }, {
            name: 'author',
            message: 'Author',
            default: this.gitConfig.user && this.gitConfig.user.name
        }, {
            name: 'authorEmail',
            message: 'Author email',
            default: this.gitConfig.user && this.gitConfig.user.email
        }, {
            name: 'gitRepo',
            message: 'Git repo'
        }, {
            name: 'license',
            message: 'License',
            default: 'MIT'
        }, {
            name: 'dbUsername',
            message: 'database_username',
            default: 'postgres'
        }, {
            name: 'dbPassword',
            message: 'database_password',
            default: null
        }, {
            name: 'dbHost',
            message: 'database_host',
            default: '127.0.0.1'
        }, {
            name: 'dbDialect',
            message: 'database_dialect',
            default: 'postgres'
        }];

        return this.prompt(prompts).then((answers) => {
            
            this.description = answers.description;
            this.author = answers.author;
            this.authorEmail = answers.authorEmail;
            this.gitRepo = answers.gitRepo;
            this.license = answers.license;
            this.dbUsername = answers.dbUsername;
            this.dbPassword = answers.dbPassword;
            this.dbHost = answers.dbHost;
            this.dbDialect = answers.dbDialect;
            this.year = new Date().getFullYear();
            this.secret = require('crypto').randomBytes(32).toString('hex');
        });
    },
    github: function () {

        this.homepageUrl = GithubUrlFromGit(this.gitRepo);
        this.isGithub = Boolean(this.homepageUrl);

        if (this.isGithub) {
            this.bugsUrl = this.homepageUrl + '/issues';
            const matches = GithubUrlFromGit.re.exec(this.gitRepo);
            this.githubOwner = matches[2].split('/')[0];
        }
        else {
            this.homepageUrl = '';
            this.bugsUrl = '';
        }
    },
    app: function () {

        Mkdirp.sync(this.appName);

        const dbDir = Path.join('db');
        Mkdirp.sync(Path.join(this.appName, dbDir));
        Mkdirp.sync(Path.join(this.appName, dbDir, 'seeders'));
        this.fs.copy(
          this.templatePath('db'),
          this.destinationPath(`${this.appName}/db`)
        )

        const serverDir = Path.join('server');
        Mkdirp.sync(Path.join(this.appName, serverDir));

        this.fs.copy(
          this.templatePath('server/models'),
          this.destinationPath(`${this.appName}/server/models`)
        )

        this.fs.copy(
          this.templatePath('server/plugins'),
          this.destinationPath(`${this.appName}/server/plugins`)
        )

        this.fs.copy(
          this.templatePath('.eslint*'),
          this.destinationPath(`${this.appName}/`)
        )

        const serverApiDir = Path.join(serverDir, 'api');
        Mkdirp.sync(Path.join(this.appName, serverApiDir));
        this.copy(Path.join(serverApiDir, 'index.js'), Path.join(this.appName, serverApiDir, 'index.js'));
        this.copy(Path.join(serverApiDir, 'user.js'), Path.join(this.appName, serverApiDir, 'user.js'));

        const serverWebDir = Path.join(serverDir, 'web');
        Mkdirp.sync(Path.join(this.appName, serverWebDir));
        this.copy(Path.join(serverWebDir, 'index.js'), Path.join(this.appName, serverWebDir, 'index.js'));
        this.copy(Path.join(serverWebDir, 'index.jade'), Path.join(this.appName, serverWebDir, 'index.jade'));

        const testDir = Path.join('test');
        Mkdirp.sync(Path.join(this.appName, testDir));
        this.copy(Path.join(testDir, 'config.js'), Path.join(this.appName, testDir, 'config.js'));
        this.copy(Path.join(testDir, 'index.js'), Path.join(this.appName, testDir, 'index.js'));
        this.copy(Path.join(testDir, 'manifest.js'), Path.join(this.appName, testDir, 'manifest.js'));

        const testArtifactsDir = Path.join(testDir, 'artifacts');
        Mkdirp.sync(Path.join(this.appName, testArtifactsDir));

        const testServerDir = Path.join(testDir, 'server');
        Mkdirp.sync(Path.join(this.appName, testServerDir));

        const testServerApiDir = Path.join(testServerDir, 'api');
        Mkdirp.sync(Path.join(this.appName, testServerApiDir));
        this.copy(Path.join(testServerApiDir, 'index.js'), Path.join(this.appName, testServerApiDir, 'index.js'));

        const testServerWebDir = Path.join(testServerDir, 'web');
        Mkdirp.sync(Path.join(this.appName, testServerWebDir));
        this.copy(Path.join(testServerWebDir, 'index.js'), Path.join(this.appName, testServerWebDir, 'index.js'));

        this.copy('-gitignore', Path.join(this.appName, '.gitignore'));
        this.copy('-travis.yml', Path.join(this.appName, '.travis.yml'));

        this.template('_config.js', Path.join(this.appName, 'config.js'));
        if (this.license.toUpperCase() === 'MIT') {
            this.template('_LICENSE', Path.join(this.appName, 'LICENSE'));
        }
        this.template('_package.json', Path.join(this.appName, 'package.json'));
        this.template('_database.json', Path.join(this.appName, '/db/database.json'));
        this.template('_README.md', Path.join(this.appName, 'README.md'));
        this.copy('index.js', Path.join(this.appName, 'index.js'));
        this.copy('manifest.js', Path.join(this.appName, 'manifest.js'));
        this.copy('server.js', Path.join(this.appName, 'server.js'));

        this.copy('.sequelizerc', Path.join(this.appName, '.sequelizerc'));
    }
});
