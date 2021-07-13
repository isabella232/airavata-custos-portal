import dotenv from 'dotenv'

dotenv.config()

// VUE_APP_CLIENT_ENTITY_TYPE_ID_ASSIGNMENT="APPOINTMENT"
// VUE_APP_CLIENT_ENTITY_TYPE_ID_SUBMISSION="PATIENT_HISTORY"
// VUE_APP_CLIENT_ENTITY_TYPE_ID_GRADING="PRESCRIPTION"
//
// VUE_APP_CLIENT_ROLE_PROFESSOR="doctor"
// VUE_APP_CLIENT_ROLE_RESEARCH_ASSISTANT="nurse"
// VUE_APP_CLIENT_ROLE_STUDENT="patient"
//
// VUE_APP_CLIENT_GROUP_ID_STUDENT="group-1_2ea05c80-bb66-40dc-851f-4c5665402234"
// VUE_APP_CLIENT_GROUP_ID_RESEARCH_ASSISTANT="dfsd_3fb3b140-9693-4e70-9898-e1eafde05d3b"
//
// VUE_APP_CLIENT_PERMISSION_TYPE_VIEWER="VIEWER"
// VUE_APP_CLIENT_PERMISSION_TYPE_EDITOR="EDITOR"
// VUE_APP_CLIENT_PERMISSION_TYPE_SHARE="SHARE"

export default class Configuration {
    static get CONFIG() {
        return {
            clientId: '$VUE_APP_CLIENT_ID',
            clientSec: '$VUE_APP_CLIENT_SEC',
            redirectURI: '$VUE_APP_REDIRECT_URI',

            entityTypeIdAssignment: '$VUE_APP_CLIENT_ENTITY_TYPE_ID_ASSIGNMENT',
            entityTypeIdSubmission: '$VUE_APP_CLIENT_ENTITY_TYPE_ID_SUBMISSION',
            entityTypeIdGrading: '$VUE_APP_CLIENT_ENTITY_TYPE_ID_GRADING',
            clientRoleProfessor: '$VUE_APP_CLIENT_ROLE_PROFESSOR',
            clientRoleResearchAssistant: '$VUE_APP_CLIENT_ROLE_RESEARCH_ASSISTANT',
            clientRoleStudent: '$VUE_APP_CLIENT_ROLE_STUDENT',
            groupIdStudent: '$VUE_APP_CLIENT_GROUP_ID_STUDENT',
            groupIdResearchAssistant: '$VUE_APP_CLIENT_GROUP_ID_RESEARCH_ASSISTANT',
            permissionTypeViewer: '$VUE_APP_CLIENT_PERMISSION_TYPE_VIEWER',
            permissionTypeEditor: '$VUE_APP_CLIENT_PERMISSION_TYPE_EDITOR',
            // permissionTypeShare: '$VUE_APP_CLIENT_PERMISSION_TYPE_SHARE'
        }
    }

    static value(name) {

        if (!(name in this.CONFIG)) {
            console.log(`Configuration: There is no key named "${name}"`)
            return
        }

        const value = this.CONFIG[name]


        if (!value) {
            console.log(`Configuration: Value for "${name}" is not defined`)
            return
        }

        if (value.startsWith('$VUE_APP_')) {
            // value was not replaced, it seems we are in development.
            // Remove $ and get current value from process.env
            const envName = value.substr(1)
            const envValue = process.env[envName]
            if (envValue) {
                return envValue
            } else {
                console.log(`Configuration: Environment variable "${envName}" is not defined`)
            }
        } else {
            // value was already replaced, it seems we are in production.
            return value
        }
    }
}