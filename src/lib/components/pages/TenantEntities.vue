<template>
  <TenantHome :title="title" :breadcrumb-links="breadcrumbLinks" :errors="errors">
    <template #header-right v-if="hasProfessorRole">
      <router-link :to="`/tenants/${clientId}/entities/new`" v-slot="{href, navigate}" tag="">
        <b-button variant="primary" @click="navigate">Create New Assignment</b-button>
      </router-link>
    </template>
    <table-overlay-info :rows="5" :columns="1" :data="assignments"
                        v-if="hasStudentRole || hasResearchAssistantRole || hasProfessorRole">
      <div v-for="(assignment, assignmentIndex) in assignments" :key="assignmentIndex">
        <div style="background-color: #f9f9f9;padding: 15px;margin-bottom: 10px;border-radius: 10px;">
          <div style="display: flex; flex-direction: row;">
            <strong style="flex: 1;font-size: 25px;color: #6e7479;">{{ assignment.fullTextJson.title }}</strong>
            <div style="display: flex; flex-direction: row;">
              <small class="text-left" style="line-height: 31px;color: #495057;">
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

                <button-overlay :show="processingDelete[assignment.entityId]">
                  <b-button variant="link" size="sm" v-on:click="onClickDelete(assignment)"
                            v-b-tooltip.hover title="Delete">
                    <b-icon icon="trash"/>
                  </b-button>
                </button-overlay>
              </div>
            </div>
          </div>
          <div>
            {{ assignment.fullTextJson.description }}
          </div>
          <div>
            <strong>Due Date</strong> : {{ assignment.fullTextJson.dueDate }}
          </div>
          <div>
            <ul class="submission-ul">
              <li v-for="(submission, submissionIndex) in assignment.fullTextJson.submissions" :key="submissionIndex">
                <div v-if="!submission.edit">
                  <div>
                    {{ submission.fullTextJson.text }}
                  </div>
                  <div style="display: flex; flex-direction: row;">
                    <small class="text-left" style="flex: 1;padding-top: 14px;color: #495057;">
                      {{ submission.createdAt }} by
                      <router-link :to="`/tenants/${clientId}/users/${submission.ownerId}`" v-slot="{href, navigate}">
                        <b-link :href="href" v-on:click="navigate">{{ submission.ownerId }}</b-link>
                      </router-link>
                    </small>
                    <div>
                      <b-button variant="link" size="sm" v-if="hasPermission(submission, permissionTypeEditor)"
                                v-on:click="onClickEditEntity(submission)" v-b-tooltip.hover title="Edit">
                        <b-icon icon="pencil"/>
                      </b-button>
                      <b-button variant="link" size="sm" v-if="hasPermission(submission, permissionTypeEditor)"
                                v-b-modal="`modal-submission-share-${submission.entityId}`" v-b-tooltip.hover
                                title="Share">
                        <b-icon icon="share"/>
                      </b-button>
                      <modal-share-entity :entity-id="submission.entityId" :client-id="clientId"
                                          :modal-id="`modal-submission-share-${submission.entityId}`"
                                          title="Share Student's Submission"/>

                      <button-overlay :show="processingDelete[submission.entityId]">
                        <b-button variant="link" size="sm" v-on:click="onClickDelete(submission)"
                                  v-b-tooltip.hover title="Delete">
                          <b-icon icon="trash"/>
                        </b-button>
                      </button-overlay>
                    </div>
                  </div>
                  <ul class="gradings-ul">
                    <li v-for="(grading, gradingIndex) in submission.fullTextJson.gradings"
                        :key="gradingIndex">
                      <div v-if="!grading.edit">
                        <div>
                          <strong>Grade : </strong>{{ grading.fullTextJson.grade }}
                        </div>
                        <div>
                          <strong>Comment : </strong>{{ grading.fullTextJson.comment }}
                        </div>
                        <div style="display: flex; flex-direction: row;">
                          <small class="text-left" style="flex: 1;padding-top: 14px;color: #495057;">
                            {{ grading.createdAt }} by
                            <router-link :to="`/tenants/${clientId}/users/${grading.ownerId}`"
                                         v-slot="{href, navigate}">
                              <b-link :href="href" v-on:click="navigate">{{ grading.ownerId }}</b-link>
                            </router-link>
                          </small>
                          <div>
                            <b-button variant="link" size="sm" v-if="hasPermission(grading, permissionTypeEditor)"
                                      v-on:click="onClickEditEntity(grading)" v-b-tooltip.hover title="Edit">
                              <b-icon icon="pencil"/>
                            </b-button>
                            <b-button variant="link" size="sm" v-if="hasPermission(grading, permissionTypeEditor)"
                                      v-b-modal="`modal-share-${grading.entityId}`" v-b-tooltip.hover
                                      title="Share">
                              <b-icon icon="share"/>
                            </b-button>
                            <modal-share-entity :entity-id="grading.entityId" :client-id="clientId"
                                                :modal-id="`modal-share-${grading.entityId}`"
                                                title="Share Student's Submission"/>

                            <button-overlay :show="processingDelete[grading.entityId]">
                              <b-button variant="link" size="sm" v-on:click="onClickDelete(grading)"
                                        v-b-tooltip.hover title="Delete">
                                <b-icon icon="trash"/>
                              </b-button>
                            </button-overlay>
                          </div>
                        </div>
                      </div>
                      <div v-else>
                        <div>
                          <b-form-input size="sm" v-model="entitiesMap[grading.entityId].fullTextJson.grade"/>
                          <b-form-input size="sm" v-model="entitiesMap[grading.entityId].fullTextJson.comment"/>
                        </div>
                        <div class="mt-3">
                          <b-button variant="primary" size="sm"
                                    v-on:click="saveGrading(assignment, submission, grading);">
                            Save
                          </b-button>
                        </div>
                      </div>
                    </li>
                  </ul>

                  <b-button
                      v-if="(hasProfessorRole || hasResearchAssistantRole) && hasPermission(submission, permissionTypeEditor)"
                      variant="link" size="sm"
                      v-on:click="addNewGrading(assignment, submission)">
                    + Create new submission grading
                  </b-button>


                </div>
                <div v-else>
                  <div>
                    <b-form-textarea size="sm" v-model="entitiesMap[submission.entityId].fullTextJson.text"/>
                  </div>
                  <div class="mt-3">
                    <b-button variant="primary" size="sm"
                              v-on:click="saveSubmission(assignment, submission);">
                      Save
                    </b-button>
                  </div>
                </div>
              </li>
            </ul>
            <b-button
                v-if="hasStudentRole && hasPermission(assignment, permissionTypeEditor) && !hasAlreadySubmitted(assignment)"
                variant="link" size="sm"
                v-on:click="addNewSubmission(assignment)">
              + Create new submission
            </b-button>

          </div>
        </div>
      </div>
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
import ButtonOverlay from "@/lib/components/overlay/button-overlay";
// import ModalShareEntity from "@/components/admin-portal/modals/modal-share-entity";
// import ButtonOverlay from "@/components/button-overlay";


const entityTypeIdAssignment = config.value('entityTypeIdAssignment');
const entityTypeIdSubmission = config.value('entityTypeIdSubmission');
const entityTypeIdGrading = config.value('entityTypeIdGrading');

const clientRoleProfessor = config.value('clientRoleProfessor');
const clientRoleResearchAssistant = config.value('clientRoleResearchAssistant');
const clientRoleStudent = config.value('clientRoleStudent');

const groupIdStudent = config.value('groupIdStudent');
// const groupIdResearchAssistant = config.value('groupIdResearchAssistant');

const permissionTypeViewer = config.value('permissionTypeViewer');
const permissionTypeEditor = config.value('permissionTypeEditor');
// const permissionTypeShare = config.value('permissionTypeShare');


export default {
  name: "TenantEntities",
  store: store,
  components: {ButtonOverlay, ModalShareEntity, TableOverlayInfo, TenantHome},
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
    hasAlreadySubmitted() {
      // if (assignment && assignment.fullTextJson.submissions) {
      //   for (let i = 0; i < assignment.fullTextJson.submissions.length; i++) {
      //     if (assignment.fullTextJson.submissions[i].ownerId === this.currentUsername) {
      //       return true;
      //     }
      //   }
      //
      //   return false;
      // }

      return false;
    },
    addNewSubmission(assignment) {
      const newSubmissionEntityId = `${assignment.entityId}_${window.performance.now()}`;
      this.entitiesMap = {
        ...this.entitiesMap,
        [newSubmissionEntityId]: {
          entityId: newSubmissionEntityId,
          type: entityTypeIdSubmission,
          saved: false,
          edit: true,
          fullTextJson: {
            "assignmentId": assignment.entityId,
            "text": "",
            "gradings": []
          }
        },
        [assignment.entityId]: {
          ...this.entitiesMap[assignment.entityId],
          fullTextJson: {
            ...this.entitiesMap[assignment.entityId].fullTextJson,
            submissions: [
              ...this.entitiesMap[assignment.entityId].fullTextJson.submissions,
              newSubmissionEntityId
            ]
          }
        }
      };
    },
    addNewGrading(assignment, submission) {
      const newGradingEntityId = `${submission.entityId}_${window.performance.now()}`;
      this.entitiesMap = {
        ...this.entitiesMap,
        [newGradingEntityId]: {
          entityId: newGradingEntityId,
          type: entityTypeIdGrading,
          saved: false,
          edit: true,
          fullTextJson: {
            "assignmentId": assignment.entityId,
            "submissionId": submission.entityId,
            "grade": "",
            "comment": ""
          }
        },
        [submission.entityId]: {
          ...this.entitiesMap[submission.entityId],
          fullTextJson: {
            ...this.entitiesMap[submission.entityId].fullTextJson,
            gradings: [
              ...this.entitiesMap[submission.entityId].fullTextJson.gradings,
              newGradingEntityId
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
    async saveSubmission(assignment, submission) {
      if (submission.saved) {
        await this.updateEntity(submission);
      } else {
        await this.saveEntity(submission);
        await this.$store.dispatch("sharing/shareEntity", {
          entityId: submission.entityId,
          clientId: this.clientId,
          permissionTypeId: permissionTypeViewer,
          groupIds: [groupIdStudent]
        });
      }

      await this.updateEntity(assignment);

      this.refreshData();
    },
    async saveGrading(assignment, submission, grading) {
      if (grading.saved) {
        await this.updateEntity(grading);
      } else {
        await this.saveEntity(grading);
        await this.$store.dispatch("sharing/shareEntity", {
          entityId: grading.entityId,
          clientId: this.clientId,
          permissionTypeId: permissionTypeViewer,
          usernames: [assignment.ownerId],
        });
      }

      await this.updateEntity(submission);

      this.refreshData();
    },
    async publishGrading(assignment, submission, grading) {
      if (grading.saved) {
        await this.updateEntity(grading);
      } else {
        await this.saveEntity(grading);
        await this.$store.dispatch("sharing/shareEntity", {
          entityId: grading.entityId,
          clientId: this.clientId,
          permissionTypeId: permissionTypeViewer,
          usernames: [submission.ownerId],
        });
      }

      this.refreshData();
    },
    async updateEntity({entityId}) {
      try {
        const entity = this.entitiesMap[entityId];
        await this.$store.dispatch("entity/updateEntity", {
          entityId: entity.entityId,
          clientId: this.clientId,
          name: `custos-health-submission-${window.performance.now()}`,
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
          name: `custos-health-submission-${window.performance.now()}`,
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
      } else if (entity.type === entityTypeIdSubmission) {
        entity = {
          ...entity,
          fullTextJson: {
            ...entity.fullTextJson,
            gradings: entity.fullTextJson.gradings.map(entityId => this.getEntity({entityId})).filter(entity => !!entity),
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
ul.submission-ul {
  list-style: none;
  padding: 0px;
}

ul.submission-ul > li {
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

ul.gradings-ul > li {
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