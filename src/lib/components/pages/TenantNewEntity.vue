<template>
  <TenantHome title="New Appointment" :breadcrumb-links="breadcrumbLinks" :errors="errors">
    <template #header-right>
      <b-button variant="primary" v-on:click="create">Create</b-button>
    </template>
    <b-overlay :show="processing">
      <div class="p-2 text-center">
        <div class="w-100 text-left" style="max-width: 600px;display: inline-block;">
          <!--          <div class="pt-3">-->
          <!--            <label class="form-label" for="name">Entity Name</label>-->
          <!--            <b-form-input-->
          <!--                v-model="name"-->
          <!--                :state="inputState.name"-->
          <!--                id="name"-->
          <!--                trim-->
          <!--                size="sm">-->
          <!--            </b-form-input>-->
          <!--            <b-form-invalid-feedback>-->
          <!--              Enter at least 2 letters-->
          <!--            </b-form-invalid-feedback>-->
          <!--          </div>-->
          <div class="pt-3">
            <label class="form-label" for="fullTextJson.patient">Patient</label>
            <b-form-input
                v-model="fullTextJson.patient"
                id="fullTextJson.patient"
                trim
                size="sm">
            </b-form-input>
          </div>

          <div class="pt-3">
            <label class="form-label" for="fullTextJson.doctorId">Doctor</label>
            <button-overlay :show="!availableDoctors" class="w-100">
              <b-form-select
                  v-if="!availableDoctors || availableDoctors.length > 0"
                  v-model="fullTextJson.doctorId"
                  :options="availableDoctors"
                  id="fullTextJson.doctorId"
                  trim
                  size="sm">
              </b-form-select>
              <small v-else>There are no doctors available</small>
            </button-overlay>


          </div>

          <div class="pt-3">
            <label class="form-label" for="fullTextJson.reason">Reason</label>
            <b-form-input
                v-model="fullTextJson.reason"
                id="fullTextJson.reason"
                trim
                size="sm">
            </b-form-input>
          </div>

          <div class="pt-3">
            <label class="form-label" for="fullTextJson.date">Date</label>
            <b-form-datepicker
                v-model="fullTextJson.date"
                id="fullTextJson.date"
                trim
                size="sm">
            </b-form-datepicker>
          </div>


        </div>
      </div>
    </b-overlay>
  </TenantHome>
</template>

<script>
import store from "../../new-service/store"
import TenantHome from "@/components/admin-portal/TenantHome";
// import ButtonOverlay from "@/components/button-overlay";
import config from "@/config";
import ButtonOverlay from "@/components/button-overlay";

// const entityTypeIdAppointment = config.value('entityTypeIdAppointment');
// const entityTypeIdPatientHistory = config.value('entityTypeIdPatientHistory');
// const entityTypeIdPrescription = config.value('entityTypeIdPrescription');

const clientRoleDoctor = config.value('clientRoleDoctor');
// const clientRoleNurse = config.value('clientRoleNurse');
// const clientRolePatient = config.value('clientRolePatient');

const groupIdDoctor = config.value('groupIdDoctor');
const groupIdNurse = config.value('groupIdNurse');

// const permissionTypeViewer = config.value('permissionTypeViewer');
const permissionTypeEditor = config.value('permissionTypeEditor');
// const permissionTypeShare = config.value('permissionTypeShare');

export default {
  name: "TenantEntities",
  store: store,
  components: {ButtonOverlay, TenantHome},
  data() {
    return {
      processing: false,
      errors: [],

      // availableDoctors: ["Dr. Aruna", "Dr. Ruwan", "Dr. Marlon"],

      // name: null,
      fullTextJson: {
        "patient": "",
        "reason": "",
        "doctorId": "",
        "visitDate": "",
        "histories": [],
        "prescriptions": []
      },
      entityTypeId: "APPOINTMENT",
      secretType: "SSH",

      availableSecretTypes: ["SSH"],

      inputFieldsList: ["name", "entityTypeId"]
    };
  },
  computed: {
    name() {
      return `custos-health-appointment-${this.fullTextJson.patient}-${this.fullTextJson.visitDate}`;
    },
    clientId() {
      console.log("this.$route.params : ", this.$route.params);
      return this.$route.params.clientId;
    },
    inputState() {
      return {
        name: this.name === null ? null : this.isValid.name,
        // description: this.description === null ? null : this.isValid.description,
        entityTypeId: this.entityTypeId === null ? null : this.isValid.entityTypeId,
      }
    },
    isValid() {
      return {
        name: !!this.name && this.name.length >= 2,
        // description: true,
        entityTypeId: !!this.entityTypeId
      }
    },
    isFormValid() {
      let _isFormValid = true;
      for (let i = 0; i < this.inputFieldsList.length; i++) {
        _isFormValid = _isFormValid && this.isValid[this.inputFieldsList[i]];
      }

      return _isFormValid;
    },
    breadcrumbLinks() {
      return [
        {to: `/tenants/${this.clientId}/entities`, name: "Entities"},
        {to: `/tenants/${this.clientId}/entities/new`, name: "New"}
      ];
    },
    entityTypes() {
      return this.$store.getters["sharing/getEntityTypes"]({clientId: this.clientId});
    },
    users() {
      return this.$store.getters["user/getUsers"]({clientId: this.clientId})
    },
    doctors() {
      return this.users ? this.users.filter(user => user.realmRoles.indexOf(clientRoleDoctor) >= 0) : this.users;
    },
    availableDoctors() {
      if (this.users) {
        return this.users.filter(user => user.realmRoles.indexOf(clientRoleDoctor) >= 0).map(({username, firstName, lastName}) => {
          return {text: `Dr. ${firstName}, ${lastName}`, value: username};
        })
      } else {
        return this.users;
      }
    }
  },
  methods: {
    makeFormVisited() {
      for (let i = 0; i < this.inputFieldsList.length; i++) {
        if (this[this.inputFieldsList[i]] === null) this[this.inputFieldsList[i]] = "";
      }
    },
    async create() {
      this.makeFormVisited()

      if (this.isFormValid) {
        this.processing = true;

        try {
          const entityId = `${this.clientId}_${window.performance.now()}`;

          await this.$store.dispatch("entity/createEntity", {
            entityId: entityId,
            clientId: this.clientId,
            name: this.name,
            fullText: JSON.stringify(this.fullTextJson),
            type: this.entityTypeId,
            ownerId: this.$store.getters["auth/currentUsername"]
          });

          await this.$store.dispatch("sharing/shareEntity", {
            entityId: entityId,
            clientId: this.clientId,
            permissionTypeId: permissionTypeEditor,
            groupIds: [groupIdDoctor, groupIdNurse]
          });

          await this.$router.push(`/tenants/${this.clientId}/entities`);
        } catch (error) {
          this.errors.push({
            title: "Unknown error when creating the entity.",
            source: error, variant: "danger"
          });
        }

        this.processing = false;
      }
    }
  },
  beforeMount() {
    this.$store.dispatch("user/fetchUsers", {clientId: this.clientId});
    this.$store.dispatch("sharing/fetchEntityTypes", {clientId: this.clientId});
  }
}
</script>

<style scoped>

</style>