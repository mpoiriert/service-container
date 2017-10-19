/*******************************************************************************
 *
 *  BUILDER.JS
 *
 *  Author: Brandon Eum
 *  Date: July 2013
 *
 ******************************************************************************/

const path = require('path');

/**
 * The builder is responsible for constructing the container and the definitions
 * based on the services.json files located anywhere within the application
 *
 * @param {function} require The require function, injected so it can be mocked
 * @param {Container} Container The constructor for the container class
 * @param {Definition} Definition The constructor for the service Definition class
 * @returns {Builder} An instance of the container builder
 */
let Builder = function Builder(require, Container, Definition) {
    this.require = require;
    this.Container = Container;
    this.Definition = Definition;
};

/**
 * Build a container base on the service configuration file directory
 * a container based on the configurations it finds.
 *
 * @param {string} configurationFile Absolute path of the service configuration
 * @returns {Container} An initialized container instance
 */
Builder.prototype.buildContainer = function (configurationFile) {
    // Construct a new Container
    let container = new this.Container(this.require, this.Definition);
    this.parseFile(configurationFile, container);
    return container;
};

/**
 * Takes a services.json file and creates service definitions or adds parameters
 * to the container instance being constructed.
 *
 * @param {string} configurationFile The full path of a configuration file to parse
 * @param {Container} container The container instance to add services and parameters to
 * @param namespace
 * @returns {void}
 */
Builder.prototype.parseFile = function (configurationFile, container, namespace) {
    namespace = namespace || '';
    let dirName = path.dirname(configurationFile);

    let config = this.loadConfiguration(configurationFile);

    // Get the namespace if specified
    if (config.namespace) {
        namespace = (namespace && namespace !== '')
            ? namespace + '.' + config.namespace
            : config.namespace;
    }

    let modifiedNs = (namespace) ? namespace + '.' : '';

    // Import other JSON files before parsing this one
    for (let i = 0; i < config.imports.length; i++) {
        let importConfigurationFile = config.imports[i];
        if (importConfigurationFile.charAt(0) === '.') {
            importConfigurationFile = dirName + '/' + importConfigurationFile;
        } else {
            importConfigurationFile = this.require.resolve(importConfigurationFile);
        }

        this.parseFile(importConfigurationFile, container, namespace);
    }

    // Add the parameters with the right namespace
    for (let i in config.parameters) {
        container.setParameter(modifiedNs + i, config.parameters[i]);
    }

    for (let i in config.services) {
        container.setDefinition(
            modifiedNs + i,
            this.buildDefinition(config.services[i], dirName, namespace),
            ''
        );
    }
};

/**
 * @param configurationFile
 * @returns {*}
 */
Builder.prototype.loadConfiguration = function(configurationFile)
{
    let config = this.require(configurationFile);
    return Object.assign({imports:[],services: [], parameters: []}, config);
}

/**
 *
 * @param config
 * @param rootDirectory
 * @param namespace
 * @returns {Definition}
 */
Builder.prototype.buildDefinition = function (config, rootDirectory, namespace) {
    let definition;
    definition = new this.Definition();
    definition.file = config.class;
    definition.rootDirectory = rootDirectory;
    definition.constructorMethod = config.constructorMethod;
    definition.arguments = config.arguments;
    definition.calls = config.calls;
    definition.properties = config.properties;
    definition.isObject = config.isObject;
    definition.isSingleton = config.isSingleton;
    definition.namespace = namespace;
    return definition;
};

module.exports = Builder;