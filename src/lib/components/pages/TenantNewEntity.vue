<template>
  <TenantHome title="New Assignment" :breadcrumb-links="breadcrumbLinks" :errors="errors">
    <template #header-right>
      <b-button variant="primary" v-on:click="create">Create</b-button>
    </template>
    <b-overlay :show="processing">
      <div class="p-2 text-center">
        <div class="w-100 text-left" style="max-width: 600px;display: inline-block;">

          <div class="pt-3">
            <label class="form-label" for="fullTextJson.title">Title</label>
            <b-form-input
                v-model="fullTextJson.title"
                id="fullTextJson.title"
                trim
                size="sm">
            </b-form-input>
          </div>

          <div class="pt-3">
            <label class="form-label" for="fullTextJson.description">Description</label>
            <b-form-textarea
                v-model="fullTextJson.description"
                id="fullTextJson.description"
                trim
                size="sm">
            </b-form-textarea>
          </div>

          <div class="pt-3">
            <label class="form-label" for="fullTextJson.date">Due Date</label>
            <b-form-datepicker
                v-model="fullTextJson.dueDate"
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
import store from "../../store"
import TenantHome from "./TenantHome";
// import ButtonOverlay from "@/components/button-overlay";
import config from "../../../config";
// import ButtonOverlay from "../overlay/button-overlay";

// const entityTypeIdAssignment = config.value('entityTypeIdAssignment');
// const entityTypeIdSubmission = config.value('entityTypeIdSubmission');
// const entityTypeIdGrading = config.value('entityTypeIdGrading');

// const clientRoleProfessor = config.value('clientRoleProfessor');
// const clientRoleTeachingAssistant = config.value('clientRoleTeachingAssistant');
// const clientRoleStudent = config.value('clientRoleStudent');

const groupIdStudent = config.value('groupIdStudent');
const groupIdTeachingAssistant = config.value('groupIdTeachingAssistant');

// const permissionTypeViewer = config.value('permissionTypeViewer');
const permissionTypeEditor = config.value('permissionTypeEditor');
// const permissionTypeShare = config.value('permissionTypeShare');

export default {
  name: "TenantEntities",
  store: store,
  components: {TenantHome},
  data() {
    return {
      processing: false,
      errors: [],

      // availableProfessors: ["Dr. Aruna", "Dr. Ruwan", "Dr. Marlon"],

      // name: null,
      fullTextJson: {
        "title": "",
        "description": "",
        "dueDate": "",
        "submissions": []
      },
      entityTypeId: "ASSIGNMENT",
      inputFieldsList: ["name", "entityTypeId"]
    };
  },
  computed: {
    name() {
      return this.title;
    },
    clientId() {
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
        {to: `/tenants/${this.clientId}/entities`, name: "Assignments"},
        {to: `/tenants/${this.clientId}/entities/new`, name: "New"}
      ];
    },
    entityTypes() {
      return this.$store.getters["sharing/getEntityTypes"]({clientId: this.clientId});
    },
    users() {
      return this.$store.getters["user/getUsers"]({clientId: this.clientId})
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
          const entityId = `assignment_${window.performance.now()}`;

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
            groupIds: [groupIdStudent, groupIdTeachingAssistant]
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