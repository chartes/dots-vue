# dots-vue-generic

Frontend application to browse a DoTS endpoint ([DoTS](https://github.com/chartes/dots)).

>:warning: Install / Launch first the DTS API (or ensure to point to deployed service):  
> See the [API Readme](https://github.com/chartes/dots)

**Master dependencies**:

[![Node](https://img.shields.io/badge/node-20_to_24-blue?style=for-the-badge&logo=Node.js)](https://nodejs.org)

[![package - vue](https://img.shields.io/github/package-json/dependency-version/chartes/DoTS-vue-generic/vue/dev?logo=vue.js&logoColor=white)](https://www.npmjs.com/package/vue)
[![package - vite](https://img.shields.io/github/package-json/dependency-version/chartes/DoTS-vue-generic/dev/vite/dev?logo=vite&logoColor=white)](https://www.npmjs.com/package/vite)
[![package - eslint](https://img.shields.io/github/package-json/dependency-version/chartes/DoTS-vue-generic/dev/eslint/dev?logo=eslint&logoColor=white)](https://www.npmjs.com/package/eslint)


[![package - Bulma](https://img.shields.io/github/package-json/dependency-version/chartes/DoTS-vue-generic/bulma/dev?logo=bulma&logoColor=white)](https://www.npmjs.com/package/bulma)
[![package - Mirador](https://img.shields.io/github/package-json/dependency-version/chartes/DoTS-vue-generic/mirador/dev)](https://www.npmjs.com/package/mirador)



## Project setup
### Clone the GitHub repository:  
in a local folder dedicated to the project
  ```bash
  git clone https://github.com/chartes/dots-vue.git
  ```

From the app folder (`cd path/to/dots-vue`)
### Install
```
yarn
```

### Compiles and hot-reloads for development

>:warning: if collections'settings have been defined, a relative path `CUSTOM_SETTINGS_PATH` environment variable has to be set as below :
```
projects_folder/					# Folder where your apps are deployed
	dots-vue/						# This cloned project
	dots-vue-my-custom-settings/	# OPTIONAL. Configuration files for a given deployed dots-vue
		configurations_files    	# See an example at [dots-vue-demo-settings](https://github.com/chartes/dots-vue-demo-settings)
```
> in this case CUSTOM_SETTINGS_PATH=../dots-vue-my-custom-settings

For a local development server, reads `.env.development` variables:
```
(CUSTOM_SETTINGS_PATH=../relative/path/to/custom/settings/folder) yarn serve
```

### Compiles and minifies for staging

For a staging server (preproduction), reads `.env.staging` variables:

```
(CUSTOM_SETTINGS_PATH=../relative/path/to/custom/settings/folder) yarn build:staging
```

### Compiles and minifies for production

For a production server, reads `.env.production` variables:

```
(CUSTOM_SETTINGS_PATH=../relative/path/to/custom/settings/folder) yarn build:prod
```

### Run preview server

After a `yarn build:prod` or `yarn build:staging` you can run a server to serve the produced `dist` folder with:

```
yarn preview
```

for production or

```
yarn preview --mode=staging
```

for staging.


### Lints and fixes files
```
yarn lint
```
