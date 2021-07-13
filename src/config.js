import dotenv from 'dotenv'

dotenv.config()

// VUE_APP_CLIENT_ENTITY_TYPE_ID_APPOINTMENT="APPOINTMENT"
// VUE_APP_CLIENT_ENTITY_TYPE_ID_PATIENT_HISTORY="PATIENT_HISTORY"
// VUE_APP_CLIENT_ENTITY_TYPE_ID_PRESCRIPTION="PRESCRIPTION"
//
// VUE_APP_CLIENT_ROLE_DOCTOR="doctor"
// VUE_APP_CLIENT_ROLE_NURSE="nurse"
// VUE_APP_CLIENT_ROLE_PATIENT="patient"
//
// VUE_APP_CLIENT_GROUP_ID_DOCTOR="group-1_2ea05c80-bb66-40dc-851f-4c5665402234"
// VUE_APP_CLIENT_GROUP_ID_NURSE="dfsd_3fb3b140-9693-4e70-9898-e1eafde05d3b"
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

            entityTypeIdAppointment: '$VUE_APP_CLIENT_ENTITY_TYPE_ID_APPOINTMENT',
            entityTypeIdPatientHistory: '$VUE_APP_CLIENT_ENTITY_TYPE_ID_PATIENT_HISTORY',
            entityTypeIdPrescription: '$VUE_APP_CLIENT_ENTITY_TYPE_ID_PRESCRIPTION',
            clientRoleDoctor: '$VUE_APP_CLIENT_ROLE_DOCTOR',
            clientRoleNurse: '$VUE_APP_CLIENT_ROLE_NURSE',
            clientRolePatient: '$VUE_APP_CLIENT_ROLE_PATIENT',
            groupIdDoctor: '$VUE_APP_CLIENT_GROUP_ID_DOCTOR',
            groupIdNurse: '$VUE_APP_CLIENT_GROUP_ID_NURSE',
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