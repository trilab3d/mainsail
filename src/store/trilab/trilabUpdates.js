const { default: axios } = require("axios");

const actionsUpdates = {
   async checkForUpdates(context, suppressUptodateMsg = false) {
        context.commit("setSupressUpdateMsg", suppressUptodateMsg);
        axios.request({  method: 'get', url: context.getters.apiPrefix + "/softwareupdate/check", timeout: 30000 })
        .then(response => {
            let data = response.data;
            if (data['information']['octoprint'] != undefined) {
                if (data['information']['octoprint']['updateAvailable']) {
                    context.commit("addUpdateTarget", "octoprint");
                }
            }
            if (data['information']['trilab'] != undefined) {
                if (data['information']['trilab']['updateAvailable']) {
                    context.commit("addUpdateTarget", "trilab");
                }
            }
            if (data['information']['canvas'] != undefined) {
                if (data['information']['canvas']['updateAvailable']) {
                    context.commit("addUpdateTarget", "canvas");
                }
            }
            if (data['information']['palette2'] != undefined) {
                if (data['information']['palette2']['updateAvailable']) {
                    context.commit("addUpdateTarget", "palette2");
                }
            }

            return true;
        }).catch(error => { return error; });


    },
    performUpdate(context, targets) {
        var data = {
            "targets": targets
            //"force": true
        };

        axios.post(context.getters.pluginPrefix + "/softwareupdate/update",{
            "data": JSON.stringify(data),
            "timeout": 10000,
        });
    },
    getChangelog(context) {    
        axios.get(context.getters.trilabPrefix + "/changelog").then(response => {
            var data = response.data;
                if (response.data != undefined) {
                    var generatedHTML = "";

                    if (data.added.length > 0) {
                        generatedHTML += "<p><b>Added:</b><br>"
                        data.added.forEach(function(n) {
                            generatedHTML += n + "<br>";
                        });
                        generatedHTML += "</p>";
                    }
                    if (data.improved.length > 0) {
                        generatedHTML += "<p><b>Improved:</b><br>"
                        data.improved.forEach(function(n) {
                            generatedHTML += n + "<br>";
                        });
                        generatedHTML += "</p>";
                    }
                    if (data.fixed.length > 0) {
                        generatedHTML += "<p><b>Fixed:</b><br>"
                        data.fixed.forEach(function(n) {
                            generatedHTML += n + "<br>";
                        });
                        generatedHTML += "</p>";
                    }
                    generatedHTML += "<br><p><span class=\"glyphicon glyphicon-alert\"></span><b> Please check the Google Play store for any potential Delta Control app updates</b></p>"
                    context.commit("setChangelog", generatedHTML);
                    return generatedHTML;
                }
        });
    },
    confirmReadChangelog(context) {
        context.commit('setChangelog', "");
        axios.post(context.getters.trilabPrefix + "/changelog/confirmread");
    }
}
    

const mutationsUpdates = {
    setChangelog(state, val){
        state.updates.changelog = val;
    },
    setSupressUpdateMsg(state, val){
		state.updates.suppressUptodateMsg = val;
	},
	addUpdateTarget(state, target){
		state.updates.targets.push(target);
	},
}
export default { actionsUpdates, mutationsUpdates };
