<template>
  <TenantHome :title="title" :breadcrumb-links="breadcrumbLinks" :errors="errors">
    <template #header-right v-if="hasProfessorRole">
      <router-link :to="`/tenants/${clientId}/entities/new`" v-slot="{href, navigate}" tag="">
        <b-button variant="primary" @click="navigate">Create New Assignment</b-button>
      </router-link>
    </template>
    <table-overlay-info :rows="5" :columns="1" :data="assignments"
                        v-if="hasStudentRole || hasResearchAssistantRole || hasProfessorRole">
      <b-table-simple>
        <b-thead>
          <b-tr>
            <b-th>Appointment</b-th>
            <b-th>History Check</b-th>
            <b-th>Prescriptions</b-th>
          </b-tr>
        </b-thead>
        <b-tbody>
          <b-tr v-for="(assignment, assignmentIndex) in assignments" :key="assignmentIndex">
            <!--          {{assignment}}-->
            <b-td>
              <div>
                <strong>Student :</strong>
                {{ assignment.fullTextJson.student }}
              </div>
              <div>
                <strong>Date :</strong>
                {{ assignment.fullTextJson.visitDate }}
              </div>
              <div>
                <strong>Reason :</strong>
                {{ assignment.fullTextJson.reason }}
              </div>
              <div>
                <strong>Professor :</strong>
                {{ assignment.fullTextJson.professorId }}
              </div>
              <div style="display: flex; flex-direction: row;">
                <small class="text-left" style="padding-top: 14px;color: #495057;">
                  {{ assignment.createdAt }} by
                  <router-link :to="`/tenants/${clientId}/users/${assignment.ownerId}`" v-slot="{href, navigate}">
                    <b-link :href="href" v-on:click="navigate">{{ assignment.ownerId }}</b-link>
                  </router-link>
                </small>
                <div>
                  <b-button v-if="hasPermission(assignment, permissionTypeEditor)" variant="link" size="sm"
                            v-b-tooltip.hover title="Share"
                            v-b-modal="`modal-assignment-share-${assignment.entityId}`">
                    <b-icon icon="share"/>
                  </b-button>
                  <modal-share-entity :entity-id="assignment.entityId" :client-id="clientId"
                                      :modal-id="`modal-assignment-share-${assignment.entityId}`"
                                      title="Share the assignment"/>
                </div>
              </div>
            </b-td>
            <b-td>
              <ul class="history-ul">
                <li v-for="(history, historyIndex) in assignment.fullTextJson.histories" :key="historyIndex">
                  <div v-if="!history.edit">
                    <div>
                      <strong>Symptoms :</strong>
                      {{ history.fullTextJson.symptoms }}
                    </div>
                    <div>
                      <strong>Allergies :</strong>
                      {{ history.fullTextJson.allergies }}
                    </div>
                    <div>
                      <strong>Blood Pressure :</strong>
                      {{ history.fullTextJson.bloodPressure }}
                    </div>
                    <div>
                      <strong>Random Blood Sugar :</strong>
                      {{ history.fullTextJson.randomBloodSugar }}
                    </div>
                    <div style="display: flex; flex-direction: row;">
                      <small class="text-left" style="flex: 1;padding-top: 14px;color: #495057;">
                        {{ history.createdAt }} by
                        <router-link :to="`/tenants/${clientId}/users/${history.ownerId}`" v-slot="{href, navigate}">
                          <b-link :href="href" v-on:click="navigate">{{ history.ownerId }}</b-link>
                        </router-link>
                      </small>
                      <div>
                        <b-button variant="link" size="sm" v-if="hasPermission(history, permissionTypeEditor)"
                                  v-on:click="onClickEditEntity(history)" v-b-tooltip.hover title="Edit">
                          <b-icon icon="pencil"/>
                        </b-button>
                        <b-button variant="link" size="sm" v-if="hasPermission(history, permissionTypeEditor)"
                                  v-b-modal="`modal-history-share-${history.entityId}`" v-b-tooltip.hover title="Share">
                          <b-icon icon="share"/>
                        </b-button>
                        <modal-share-entity :entity-id="history.entityId" :client-id="clientId"
                                            :modal-id="`modal-history-share-${history.entityId}`"
                                            title="Share Student's History"/>
                      </div>
                    </div>
                  </div>
                  <div v-else>
                    <div>
                      <label class="form-label">Symptoms</label>
                      <b-form-input size="sm" v-model="history.fullTextJson.symptoms"/>
                    </div>
                    <div>
                      <label class="form-label">Allergies</label>
                      <b-form-input size="sm" v-model="history.fullTextJson.allergies"/>
                    </div>
                    <div>
                      <label class="form-label">Blood Pressure</label>
                      <b-form-input size="sm" v-model="history.fullTextJson.bloodPressure"/>
                    </div>
                    <div>
                      <label class="form-label">Random Blood Sugar</label>
                      <b-form-input size="sm" v-model="history.fullTextJson.randomBloodSugar"/>
                    </div>
                    <div class="mt-3">
                      <b-button variant="primary" size="sm"
                                v-on:click="saveHistory(assignment, history);">
                        Save
                      </b-button>
                    </div>
                  </div>
                </li>
              </ul>
              <b-button v-if="hasResearchAssistantRole && hasPermission(assignment, permissionTypeEditor)"
                        variant="link" size="sm"
                        v-on:click="addNewHealthCheck(assignment)">
                + Create new health check
              </b-button>
            </b-td>
            <b-td>
              <ul class="prescriptions-ul">
                <li v-for="(prescription, prescriptionIndex) in assignment.fullTextJson.prescriptions"
                    :key="prescriptionIndex">
                  <div v-if="!prescription.edit">
                    <div>
                      <strong>MEDICATIONS</strong>
                      <ul class="prescription-medications-ul">
                        <li v-for="(medication, medicationIndex) in prescription.fullTextJson.medications"
                            :key="medicationIndex">
                          <strong>{{ medication.name }} :</strong>
                          {{ medication.dose }}
                        </li>
                      </ul>
                    </div>

                    <div>
                      <strong>RECOMMENDATIONS</strong>
                      <ul class="prescription-recommendations-ul">
                        <li v-for="(recommendation, recommendationIndex) in prescription.fullTextJson.recommendations"
                            :key="recommendationIndex">
                          {{ recommendation }}
                        </li>
                      </ul>
                    </div>

                    <div style="display: flex; flex-direction: row;">
                      <small class="text-left" style="flex: 1;padding-top: 14px;color: #495057;">
                        {{ prescription.createdAt }} by
                        <router-link :to="`/tenants/${clientId}/users/${prescription.ownerId}`"
                                     v-slot="{href, navigate}">
                          <b-link :href="href" v-on:click="navigate">{{ prescription.ownerId }}</b-link>
                        </router-link>
                      </small>
                      <div>
                        <b-button variant="link" size="sm" v-if="hasPermission(prescription, permissionTypeEditor)"
                                  v-on:click="onClickEditEntity(prescription)">
                          <b-icon icon="pencil" v-b-tooltip.hover title="Edit"/>
                        </b-button>
                        <b-button variant="link" size="sm" v-if="hasPermission(prescription, permissionTypeEditor)"
                                  v-b-modal="`modal-prescription-share-${prescription.entityId}`" v-b-tooltip.hover
                                  title="Share">
                          <b-icon icon="share"/>
                        </b-button>
                        <modal-share-entity :entity-id="prescription.entityId" :client-id="clientId"
                                            :modal-id="`modal-prescription-share-${prescription.entityId}`"
                                            title="Share Prescription"/>
                      </div>
                    </div>
                  </div>
                  <div v-else>
                    <div>
                      <label class="form-label">MEDICATIONS</label>
                      <b-button variant="link" size="sm"
                                v-on:click="prescription.fullTextJson.medications.push({name: '', dose: ''})">
                        + Add
                      </b-button>
                      <div v-for="(medication, medicationIndex) in prescription.fullTextJson.medications"
                           :key="medicationIndex">
                        <div style="display: flex; flex-direction: row;">
                          <b-form-select size="sm" :options="availableMedications" v-model="medication.name"/>
                          <b-form-input size="sm" v-model="medication.dose"/>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label class="form-label">RECOMMENDATIONS</label>
                      <b-button variant="link" size="sm"
                                v-on:click="prescription.fullTextJson.recommendations.push('')">
                        + Add
                      </b-button>
                      <div v-for="(recommendation, recommendationIndex) in prescription.fullTextJson.recommendations"
                           :key="recommendationIndex">
                        <b-form-input size="sm"
                                      v-model="prescription.fullTextJson.recommendations[recommendationIndex]"/>
                      </div>
                    </div>
                    <div class="mt-3">
                      <b-button variant="primary" size="sm"
                                v-on:click="savePrescription(assignment, prescription);">Save
                      </b-button>
                    </div>
                  </div>
                </li>
              </ul>

              <b-button v-if="hasProfessorRole && hasPermission(assignment, permissionTypeEditor)" variant="link"
                        size="sm"
                        v-on:click="addNewPrescription(assignment)">
                + Add new prescription
              </b-button>
            </b-td>
          </b-tr>
        </b-tbody>
      </b-table-simple>
    </table-overlay-info>
    <div v-else>Unauthorized. Please contact the system administrator.</div>
  </TenantHome>
</template>

<script>
import store from "../../store"
import TenantHome from "./TenantHome";
import TableOverlayInfo from "../overlay/table-overlay-info";
import config from "../../../config";
import ModalShareEntity from "../modals/modal-share-entity";
// import ModalShareEntity from "@/components/admin-portal/modals/modal-share-entity";
// import ButtonOverlay from "@/components/button-overlay";


const entityTypeIdAssignment = config.value('entityTypeIdAssignment');
const entityTypeIdStudentSubmission = config.value('entityTypeIdStudentSubmission');
const entityTypeIdGrading = config.value('entityTypeIdGrading');

const clientRoleProfessor = config.value('clientRoleProfessor');
const clientRoleResearchAssistant = config.value('clientRoleResearchAssistant');
const clientRoleStudent = config.value('clientRoleStudent');

const groupIdProfessor = config.value('groupIdProfessor');
// const groupIdResearchAssistant = config.value('groupIdResearchAssistant');

const permissionTypeViewer = config.value('permissionTypeViewer');
const permissionTypeEditor = config.value('permissionTypeEditor');
// const permissionTypeShare = config.value('permissionTypeShare');


export default {
  name: "TenantEntities",
  store: store,
  components: {ModalShareEntity, TableOverlayInfo, TenantHome},
  data() {
    return {
      processingDelete: {},
      errors: [],

      availableMedications: [
        "Synthroid", "Crestor", "Ventolin HFA", "Nexium", "Advair Diskus", "Lantus Solostar", "Vyvanse", "Lyrica"
      ],

      entitiesMap: {},
      assignmentEntityIds: [],

      permissionTypeEditor,
      // permissionTypeShare
    }
  },
  computed: {
    title() {
      if (this.hasStudentRole || this.hasResearchAssistantRole || this.hasProfessorRole) {
        return "Appointments";
      } else {
        return "Unauthorized";
      }
    },
    clientId() {
      return this.$route.params.clientId;
    },
    assignments() {
      return this.assignmentEntityIds.map(entityId => this.getEntity({entityId}));
    },
    entities() {
      return this.$store.getters["entity/getEntities"]({clientId: this.clientId, ownerId: this.currentUsername})
    },
    breadcrumbLinks() {
      return [];
    },
    currentUsername() {
      return this.$store.getters["auth/currentUsername"];
    },
    currentUser() {
      return this.$store.getters["user/getUser"]({clientId: this.clientId, username: this.currentUsername})
    },
    hasProfessorRole() {
      return this.currentUser && this.currentUser.realmRoles.indexOf(clientRoleProfessor) >= 0;
    },
    hasResearchAssistantRole() {
      return this.currentUser && this.currentUser.realmRoles.indexOf(clientRoleResearchAssistant) >= 0;
    },
    hasStudentRole() {
      return this.currentUser && this.currentUser.realmRoles.indexOf(clientRoleStudent) >= 0;
    }
  },
  methods: {
    addNewHealthCheck(assignment) {
      const newHealthCheckEntityId = `${assignment.entityId}_${window.performance.now()}`;
      this.entitiesMap = {
        ...this.entitiesMap,
        [newHealthCheckEntityId]: {
          entityId: newHealthCheckEntityId,
          type: entityTypeIdStudentSubmission,
          saved: false,
          edit: true,
          fullTextJson: {
            "symptoms": "",
            "allergies": "",
            "bloodPressure": "",
            "randomBloodSugar": ""
          }
        },
        [assignment.entityId]: {
          ...this.entitiesMap[assignment.entityId],
          fullTextJson: {
            ...this.entitiesMap[assignment.entityId].fullTextJson,
            histories: [
              ...this.entitiesMap[assignment.entityId].fullTextJson.histories,
              newHealthCheckEntityId
            ]
          }
        }
      };
    },
    addNewPrescription(assignment) {
      const newPrescriptionEntityId = `${assignment.entityId}_${window.performance.now()}`;
      this.entitiesMap = {
        ...this.entitiesMap,
        [newPrescriptionEntityId]: {
          entityId: newPrescriptionEntityId,
          type: entityTypeIdGrading,
          saved: false,
          edit: true,
          fullTextJson: {
            "medications": [
              // {"name": "Panadol", "dose": 23},
              // {"name": "Vitamin C", "dose": 40}
            ],
            "recommendations": [
              // "Bed Rest", "Steam"
            ]
          }
        },
        [assignment.entityId]: {
          ...this.entitiesMap[assignment.entityId],
          fullTextJson: {
            ...this.entitiesMap[assignment.entityId].fullTextJson,
            prescriptions: [
              ...this.entitiesMap[assignment.entityId].fullTextJson.prescriptions,
              newPrescriptionEntityId
            ]
          }
        }
      };
    },
    onClickEditEntity({entityId}) {
      this.entitiesMap = {
        ...this.entitiesMap,
        [entityId]: {
          ...this.entitiesMap[entityId],
          edit: true
        }
      };
    },
    async saveHistory(assignment, history) {
      if (history.saved) {
        await this.updateEntity(history);
      } else {
        await this.saveEntity(history);
        await this.$store.dispatch("sharing/shareEntity", {
          entityId: history.entityId,
          clientId: this.clientId,
          permissionTypeId: permissionTypeViewer,
          groupIds: [groupIdProfessor]
        });
      }

      await this.updateEntity(assignment);

      this.refreshData();
    },
    async savePrescription(assignment, prescription) {
      if (prescription.saved) {
        await this.updateEntity(prescription);
      } else {
        await this.saveEntity(prescription);
        await this.$store.dispatch("sharing/shareEntity", {
          entityId: prescription.entityId,
          clientId: this.clientId,
          permissionTypeId: permissionTypeViewer,
          usernames: [assignment.ownerId]
        });
      }

      await this.updateEntity(assignment);

      this.refreshData();
    },
    async updateEntity({entityId}) {
      try {
        const entity = this.entitiesMap[entityId];
        await this.$store.dispatch("entity/updateEntity", {
          entityId: entity.entityId,
          clientId: this.clientId,
          name: `custos-health-history-${window.performance.now()}`,
          fullText: JSON.stringify(entity.fullTextJson),
          type: entity.type,
          ownerId: entity.ownerId
        });

        this.entitiesMap = {
          ...this.entitiesMap,
          [entity.entityId]: {
            ...this.entitiesMap[entity.entityId],
            edit: false
          }
        };
      } catch (error) {
        this.errors.push({
          title: "Unknown error when updating the entity.",
          source: error, variant: "danger"
        });
      }
    },
    async saveEntity({entityId}) {
      try {
        const entity = this.entitiesMap[entityId];
        await this.$store.dispatch("entity/createEntity", {
          entityId: entity.entityId,
          clientId: this.clientId,
          name: `custos-health-history-${window.performance.now()}`,
          fullText: JSON.stringify(entity.fullTextJson),
          type: entity.type,
          ownerId: this.$store.getters["auth/currentUsername"]
        });

        this.entitiesMap = {
          ...this.entitiesMap,
          [entity.entityId]: {
            ...this.entitiesMap[entity.entityId],
            saved: true
          }
        }
      } catch (error) {
        this.errors.push({
          title: "Unknown error when creating the entity.",
          source: error, variant: "danger"
        });
      }
    },
    getEntity({entityId}) {
      let entity = this.entitiesMap[entityId];
      if (!entity) {
        return null;
      } else if (entity.type === entityTypeIdAssignment) {
        entity = {
          ...entity,
          fullTextJson: {
            ...entity.fullTextJson,
            submissions: entity.fullTextJson.submissions.map(entityId => this.getEntity({entityId})).filter(entity => !!entity),
          }
        }
      } else {
        entity = {
          ...entity
        }
      }

      return entity;
    },
    hasPermission({entityId}, permissionTypeId) {
      const status = this.$store.getters["sharing/getUserAccessStatus"]({
        clientId: this.clientId, entityId, permissionTypeId, username: this.currentUsername
      });

      if (status) {
        return status;
      } else {
        return false;
      }
    },
    refreshData() {
      this.$store.dispatch("entity/fetchEntities", {clientId: this.clientId, ownerId: this.currentUsername});
    },
    resetData() {
      this.entitiesMap = {};
      this.assignmentEntityIds = [];

      if (this.entities) {
        for (let i = 0; i < this.entities.length; i++) {
          const entity = {...this.entities[i]};

          this.$store.dispatch("sharing/userHasAccess", {
            clientId: this.clientId,
            entityId: entity.entityId,
            permissionTypeId: permissionTypeEditor,
            username: this.currentUsername
          });

          entity.saved = true;
          entity.edit = false;

          try {
            entity.fullTextJson = JSON.parse(entity.fullText);
          } catch (err) {
            entity.fullTextJson = {};
          }

          this.entitiesMap[entity.entityId] = entity;

          if (entity.type === entityTypeIdAssignment) {
            this.assignmentEntityIds.push(entity.entityId);
          }
        }
      }
    },
    async onClickDelete({entityId, name, description, type, ownerId}) {
      this.processingDelete = {...this.processingDelete, [entityId]: true};

      try {
        await this.$store.dispatch("entity/deleteEntity", {
          clientId: this.clientId,
          entityId,
          name,
          description,
          type,
          ownerId
        });
        this.refreshData();
      } catch (error) {
        this.errors.push({
          title: `Unknown error when deleting the entity '${entityId}'.`,
          source: error, variant: "danger"
        });
      }

      this.processingDelete = {...this.processingDelete, [entityId]: false};
    }
  },
  watch: {
    entities() {
      this.resetData();
    }
  },
  mounted() {
    this.refreshData();
    this.resetData();
  }
}
</script>

<style scoped>
ul.history-ul {
  list-style: none;
  padding: 0px;
}

ul.history-ul > li {
  list-style: none;
  padding: 10px;
  background-color: #cdf0c2;
  border-radius: 5px;
  margin: 10px;
}

ul.prescriptions-ul {
  list-style: none;
  padding: 0px;
}

ul.prescriptions-ul > li {
  list-style: none;
  padding: 10px;
  background-color: #bee5eb;
  border-radius: 5px;
  margin: 10px;
}

ul.prescription-medications-ul {
  /*list-style: none;*/
  /*padding: 0px;*/
}

ul.prescription-recommendations-ul {
  /*padding: 0px;*/
}
</style>