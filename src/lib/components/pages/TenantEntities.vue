<template>
  <TenantHome :title="title" :breadcrumb-links="breadcrumbLinks" :errors="errors">
    <template #header-right v-if="hasPatientRole">
      <router-link :to="`/tenants/${clientId}/entities/new`" v-slot="{href, navigate}" tag="">
        <b-button variant="primary" @click="navigate">Make an Appointment</b-button>
      </router-link>
    </template>
    <table-overlay-info :rows="5" :columns="1" :data="appointments"
                        v-if="hasPatientRole || hasNurseRole || hasDoctorRole">
      <b-table-simple>
        <b-thead>
          <b-tr>
            <b-th>Appointment</b-th>
            <b-th>History Check</b-th>
            <b-th>Prescriptions</b-th>
          </b-tr>
        </b-thead>
        <b-tbody>
          <b-tr v-for="(appointment, appointmentIndex) in appointments" :key="appointmentIndex">
            <!--          {{appointment}}-->
            <b-td>
              <div>
                <strong>Patient :</strong>
                {{ appointment.fullTextJson.patient }}
              </div>
              <div>
                <strong>Date :</strong>
                {{ appointment.fullTextJson.visitDate }}
              </div>
              <div>
                <strong>Reason :</strong>
                {{ appointment.fullTextJson.reason }}
              </div>
              <div>
                <strong>Doctor :</strong>
                {{ appointment.fullTextJson.doctorId }}
              </div>
              <div style="display: flex; flex-direction: row;">
                <small class="text-left" style="padding-top: 14px;color: #495057;">
                  {{ appointment.createdAt }} by
                  <router-link :to="`/tenants/${clientId}/users/${appointment.ownerId}`" v-slot="{href, navigate}">
                    <b-link :href="href" v-on:click="navigate">{{ appointment.ownerId }}</b-link>
                  </router-link>
                </small>
                <div>
                  <b-button v-if="hasPermission(appointment, permissionTypeEditor)" variant="link" size="sm"
                            v-b-tooltip.hover title="Share"
                            v-b-modal="`modal-appointment-share-${appointment.entityId}`">
                    <b-icon icon="share"/>
                  </b-button>
                  <modal-share-entity :entity-id="appointment.entityId" :client-id="clientId"
                                      :modal-id="`modal-appointment-share-${appointment.entityId}`"
                                      title="Share the appointment"/>
                </div>
              </div>
            </b-td>
            <b-td>
              <ul class="history-ul">
                <li v-for="(history, historyIndex) in appointment.fullTextJson.histories" :key="historyIndex">
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
                                            title="Share Patient's History"/>
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
                                v-on:click="saveHistory(appointment, history);">
                        Save
                      </b-button>
                    </div>
                  </div>
                </li>
              </ul>
              <b-button v-if="hasNurseRole && hasPermission(appointment, permissionTypeEditor)" variant="link" size="sm"
                        v-on:click="addNewHealthCheck(appointment)">
                + Create new health check
              </b-button>
            </b-td>
            <b-td>
              <ul class="prescriptions-ul">
                <li v-for="(prescription, prescriptionIndex) in appointment.fullTextJson.prescriptions"
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
                                v-on:click="savePrescription(appointment, prescription);">Save
                      </b-button>
                    </div>
                  </div>
                </li>
              </ul>

              <b-button v-if="hasDoctorRole && hasPermission(appointment, permissionTypeEditor)" variant="link"
                        size="sm"
                        v-on:click="addNewPrescription(appointment)">
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
import store from "../../new-service/store"
import TenantHome from "@/components/admin-portal/TenantHome";
import TableOverlayInfo from "@/components/table-overlay-info";
import config from "@/config";
import ModalShareEntity from "@/components/admin-portal/modals/modal-share-entity";
// import ModalShareEntity from "@/components/admin-portal/modals/modal-share-entity";
// import ButtonOverlay from "@/components/button-overlay";


const entityTypeIdAppointment = config.value('entityTypeIdAppointment');
const entityTypeIdPatientHistory = config.value('entityTypeIdPatientHistory');
const entityTypeIdPrescription = config.value('entityTypeIdPrescription');

const clientRoleDoctor = config.value('clientRoleDoctor');
const clientRoleNurse = config.value('clientRoleNurse');
const clientRolePatient = config.value('clientRolePatient');

const groupIdDoctor = config.value('groupIdDoctor');
// const groupIdNurse = config.value('groupIdNurse');

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
      appointmentEntityIds: [],

      permissionTypeEditor,
      // permissionTypeShare
    }
  },
  computed: {
    title() {
      if (this.hasPatientRole || this.hasNurseRole || this.hasDoctorRole) {
        return "Appointments";
      } else {
        return "Unauthorized";
      }
    },
    clientId() {
      return this.$route.params.clientId;
    },
    appointments() {
      return this.appointmentEntityIds.map(entityId => this.getEntity({entityId}));
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
    hasDoctorRole() {
      return this.currentUser && this.currentUser.realmRoles.indexOf(clientRoleDoctor) >= 0;
    },
    hasNurseRole() {
      return this.currentUser && this.currentUser.realmRoles.indexOf(clientRoleNurse) >= 0;
    },
    hasPatientRole() {
      return this.currentUser && this.currentUser.realmRoles.indexOf(clientRolePatient) >= 0;
    }
  },
  methods: {
    addNewHealthCheck(appointment) {
      const newHealthCheckEntityId = `${appointment.entityId}_${window.performance.now()}`;
      this.entitiesMap = {
        ...this.entitiesMap,
        [newHealthCheckEntityId]: {
          entityId: newHealthCheckEntityId,
          type: entityTypeIdPatientHistory,
          saved: false,
          edit: true,
          fullTextJson: {
            "symptoms": "",
            "allergies": "",
            "bloodPressure": "",
            "randomBloodSugar": ""
          }
        },
        [appointment.entityId]: {
          ...this.entitiesMap[appointment.entityId],
          fullTextJson: {
            ...this.entitiesMap[appointment.entityId].fullTextJson,
            histories: [
              ...this.entitiesMap[appointment.entityId].fullTextJson.histories,
              newHealthCheckEntityId
            ]
          }
        }
      };
    },
    addNewPrescription(appointment) {
      const newPrescriptionEntityId = `${appointment.entityId}_${window.performance.now()}`;
      this.entitiesMap = {
        ...this.entitiesMap,
        [newPrescriptionEntityId]: {
          entityId: newPrescriptionEntityId,
          type: entityTypeIdPrescription,
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
        [appointment.entityId]: {
          ...this.entitiesMap[appointment.entityId],
          fullTextJson: {
            ...this.entitiesMap[appointment.entityId].fullTextJson,
            prescriptions: [
              ...this.entitiesMap[appointment.entityId].fullTextJson.prescriptions,
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
    async saveHistory(appointment, history) {
      if (history.saved) {
        await this.updateEntity(history);
      } else {
        await this.saveEntity(history);
        await this.$store.dispatch("sharing/shareEntity", {
          entityId: history.entityId,
          clientId: this.clientId,
          permissionTypeId: permissionTypeViewer,
          groupIds: [groupIdDoctor]
        });
      }

      await this.updateEntity(appointment);

      this.refreshData();
    },
    async savePrescription(appointment, prescription) {
      if (prescription.saved) {
        await this.updateEntity(prescription);
      } else {
        await this.saveEntity(prescription);
        await this.$store.dispatch("sharing/shareEntity", {
          entityId: prescription.entityId,
          clientId: this.clientId,
          permissionTypeId: permissionTypeViewer,
          usernames: [appointment.ownerId]
        });
      }

      await this.updateEntity(appointment);

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
      } else if (entity.type === entityTypeIdAppointment) {
        entity = {
          ...entity,
          fullTextJson: {
            ...entity.fullTextJson,
            histories: entity.fullTextJson.histories.map(entityId => this.getEntity({entityId})).filter(entity => !!entity),
            prescriptions: entity.fullTextJson.prescriptions.map(entityId => this.getEntity({entityId})).filter(entity => !!entity)
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
      this.appointmentEntityIds = [];

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

          if (entity.type === entityTypeIdAppointment) {
            this.appointmentEntityIds.push(entity.entityId);
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