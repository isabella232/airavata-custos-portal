<template>
  <TenantHome :title="title" :breadcrumb-links="breadcrumbLinks" :errors="errors">
    <template #header-right v-if="hasProfessorRole">
      <router-link :to="`/tenants/${clientId}/entities/new`" v-slot="{href, navigate}" tag="">
        <b-button variant="primary" @click="navigate">Create New Assignment</b-button>
      </router-link>
    </template>
    <table-overlay-info :rows="5" :columns="1" :data="assignments"
                        v-if="hasStudentRole || hasTeachingAssistantRole || hasProfessorRole">
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
              <div v-if="hasPermission(assignment, permissionTypeEditor)">
                <b-button variant="link" size="sm"
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


            <div v-if="hasStudentRole" class="pt-4">
              <div v-if="mySubmission(assignment).hasSubmitted">
                <div style="display: flex; flex-direction: row;">
                  <div>
                    <b-button variant="secondary" v-b-modal="`submission-modal-${assignment.entityId}`">
                      View Submission
                    </b-button>
                  </div>
                  <div
                      v-if="mySubmission(assignment).hasSubmitted && hasPermission(mySubmission(assignment).submission, permissionTypeEditor)">
                    <b-button variant="link" size="sm"
                              v-b-tooltip.hover title="Share"
                              v-b-modal="`modal-share-${mySubmission(assignment).submission.entityId}`">
                      <b-icon icon="share"/>
                      Share Submission
                    </b-button>
                    <modal-share-entity :entity-id="mySubmission(assignment).submission.entityId" :client-id="clientId"
                                        :modal-id="`modal-share-${mySubmission(assignment).submission.entityId}`"
                                        title="Share the Submission"/>
                  </div>
                </div>
                <div v-if="mySubmission(assignment).hasGradePublished" class="pt-4"
                     style="display: flex; flex-direction: row;">
                  <div class="pr-4">
                    <strong>Grade : </strong> {{ mySubmission(assignment).publishedGradings[0].fullTextJson.grade }}
                  </div>
                  <div>
                    <strong>Comment : </strong> {{ mySubmission(assignment).publishedGradings[0].fullTextJson.comment }}
                  </div>
                </div>
              </div>
              <div v-else>
                <b-button variant="link"
                          v-on:click="addNewSubmission(assignment);$bvModal.show(`submission-modal-${assignment.entityId}`);">
                  Create New Submission
                </b-button>
              </div>
              <b-modal :id="`submission-modal-${assignment.entityId}`">
                <template #modal-title>
                  Submission By {{ mySubmission(assignment).submission.ownerId }}
                </template>
                <div v-if="mySubmission(assignment).submission">
                  <b-form-textarea size="sm" :disabled="!mySubmission(assignment).submission.edit"
                                   v-model="entitiesMap[mySubmission(assignment).submission.entityId].fullTextJson.text"/>
                </div>
                <template #modal-footer="{close}">
                  <b-button variant="primary" v-if="mySubmission(assignment).submission.edit"
                            v-on:click="saveSubmission(assignment, mySubmission(assignment).submission);close();">
                    Save
                  </b-button>
                  <b-button variant="secondary" v-on:click="close();">
                    Close
                  </b-button>
                </template>
              </b-modal>
            </div>

            <b-table-simple v-else>
              <b-thead>
                <b-th>Student</b-th>
                <b-th>Status</b-th>
                <b-th>Submission</b-th>
                <b-th>Grading</b-th>
                <b-th></b-th>
              </b-thead>
              <b-tbody>
                <b-tr v-for="(studentSubmission, studentSubmissionIndex) in studentSubmissions(assignment)"
                      :key="studentSubmissionIndex">
                  <b-td>{{ studentSubmission.studentId }}</b-td>
                  <b-td>
                    <template v-if="studentSubmission.hasGradePublished">Grade Released</template>
                    <template v-else-if="studentSubmission.hasGraded">Graded</template>
                    <template v-else-if="studentSubmission.hasSubmitted">Submitted</template>
                    <template v-else>Not Submitted</template>
                  </b-td>
                  <b-td>
                    <div v-if="studentSubmission.submission">
                      <b-button variant="secondary" size="sm"
                                v-b-modal="`submission-modal-${studentSubmission.submission.entityId}`">
                        View Submission
                      </b-button>
                      <b-modal :id="`submission-modal-${studentSubmission.submission.entityId}`">
                        <template #modal-title>
                          Submission By {{ studentSubmission.submission.ownerId }}
                        </template>
                        <div>
                          <b-form-textarea size="sm" disabled
                                           v-model="entitiesMap[studentSubmission.submission.entityId].fullTextJson.text"/>
                        </div>
                        <template #modal-footer="{close}">
                          <b-button variant="secondary" v-on:click="close()">
                            close
                          </b-button>
                        </template>
                      </b-modal>

                      <template
                          v-if="studentSubmission.hasSubmitted && hasPermission(studentSubmission.submission, permissionTypeEditor)">
                        <b-button variant="link" size="sm"
                                  v-b-tooltip.hover title="Share"
                                  v-b-modal="`modal-share-${studentSubmission.submission.entityId}`">
                          <b-icon icon="share"/>
                          Share Submission
                        </b-button>
                        <modal-share-entity :entity-id="studentSubmission.submission.entityId" :client-id="clientId"
                                            :modal-id="`modal-share-${studentSubmission.submission.entityId}`"
                                            title="Share the Submission"/>
                      </template>
                    </div>
                  </b-td>
                  <b-td>
                    <div v-if="studentSubmission.submission">
                      <ul class="gradings-ul">
                        <li v-for="(grading, gradingIndex) in (studentSubmission.hasGradePublished ? studentSubmission.publishedGradings : studentSubmission.submission.gradings)"
                            :key="gradingIndex">
                          <div v-if="grading.edit">
                            <div class="pt-3">
                              <b-form-select :options="['A+', 'A', 'A-','B+', 'B', 'B-','C+', 'C', 'C-','D', 'F']"
                                             size="sm"
                                             v-model="entitiesMap[grading.entityId].fullTextJson.grade"/>
                            </div>
                            <div class="pt-3">
                              <b-form-textarea size="sm"
                                               v-model="entitiesMap[grading.entityId].fullTextJson.comment"/>
                            </div>
                            <div class="pt-3">
                              <b-button variant="primary" size="sm" class="mr-3"
                                        v-on:click="saveGrading(assignment, studentSubmission.submission, grading);">
                                Save Grading
                              </b-button>
                              <b-button variant="secondary" size="sm"
                                        v-on:click="closeNewGrading(grading)">
                                Cancel
                              </b-button>
                            </div>
                          </div>
                          <div v-else style="display: flex; flex-direction: row;">
                            <div style="flex: 1;">
                              <div>
                                <strong>Grade : </strong> {{ grading.fullTextJson.grade }}
                              </div>
                              <div>
                                <strong>Comment : </strong> {{ grading.fullTextJson.comment }}
                              </div>
                              <div>
                                <small class="text-left" style="line-height: 31px;color: #495057;">
                                  {{ grading.createdAt }} by
                                  <router-link :to="`/tenants/${clientId}/users/${grading.ownerId}`"
                                               v-slot="{href, navigate}">
                                    <b-link :href="href" v-on:click="navigate">{{ grading.ownerId }}</b-link>
                                  </router-link>
                                </small>
                              </div>
                            </div>
                            <div>
                              <div v-if="hasProfessorRole && !studentSubmission.hasGradePublished">
                                <b-button variant="secondary" size="sm" class="mr-3"
                                          v-on:click="publishGrading(assignment, studentSubmission.submission, grading)">
                                  Release Grade
                                </b-button>
                              </div>
                              <div v-if="hasPermission(grading, permissionTypeEditor)">
                                <b-button variant="link" size="sm"
                                          v-b-tooltip.hover title="Share"
                                          v-b-modal="`modal-assignment-share-${grading.entityId}`">
                                  <b-icon icon="share"/>
                                  Share Grading
                                </b-button>
                                <modal-share-entity :entity-id="grading.entityId" :client-id="clientId"
                                                    :modal-id="`modal-assignment-share-${grading.entityId}`"
                                                    title="Share the assignment"/>
                              </div>
                              <div v-if="hasPermission(grading, permissionTypeEditor)">
                                <button-overlay :show="processingDelete[grading.entityId]">
                                  <b-button variant="link" size="sm" v-on:click="onClickDelete(grading)"
                                            v-b-tooltip.hover title="Delete">
                                    <b-icon icon="trash"/>
                                    Delete Grading
                                  </b-button>
                                </button-overlay>
                              </div>
                            </div>
                          </div>
                        </li>
                      </ul>

                      <div v-if="!studentSubmission.hasGradePublished">
                        <b-button
                            v-if="(hasProfessorRole || hasTeachingAssistantRole) && hasPermission(studentSubmission.submission, permissionTypeViewer)"
                            variant="link" size="sm"
                            v-on:click="addNewGrading(assignment, studentSubmission.submission)">
                          + Create grading
                        </b-button>
                      </div>

                      <!--                      <b-button variant="secondary" size="sm"-->
                      <!--                                v-b-modal="`submission-modal-${studentSubmission.submission.entityId}`">-->
                      <!--                        View Submission-->
                      <!--                      </b-button>-->
                      <!--                      <b-modal :id="`submission-modal-${studentSubmission.submission.entityId}`">-->
                      <!--                        <template #modal-title>-->
                      <!--                          Submission By {{ studentSubmission.submission.ownerId }}-->
                      <!--                        </template>-->
                      <!--                        <div>-->
                      <!--                          <b-form-textarea size="sm" disabled-->
                      <!--                                           v-model="entitiesMap[studentSubmission.submission.entityId].fullTextJson.text"/>-->
                      <!--                          <div v-if="studentSubmission.grading && !studentSubmission.hasGradePublished">-->
                      <!--                            <div class="pt-3">-->
                      <!--                              <b-form-select :options="['A+', 'A', 'A-','B+', 'B', 'B-','C+', 'C', 'C-','D', 'F']"-->
                      <!--                                             size="sm"-->
                      <!--                                             v-model="entitiesMap[studentSubmission.grading.entityId].fullTextJson.grade"/>-->
                      <!--                            </div>-->
                      <!--                            <div class="pt-3">-->
                      <!--                              <b-form-input size="sm"-->
                      <!--                                            v-model="entitiesMap[studentSubmission.grading.entityId].fullTextJson.comment"/>-->
                      <!--                            </div>-->
                      <!--                          </div>-->

                      <!--                        </div>-->
                      <!--                        <template #modal-footer="{close}">-->
                      <!--                          <b-button variant="primary" size="sm"-->
                      <!--                                    v-if="studentSubmission.grading && !studentSubmission.hasGradePublished"-->
                      <!--                                    v-on:click="saveGrading(assignment, studentSubmission.submission, studentSubmission.grading);close()">-->
                      <!--                            Save Grading-->
                      <!--                          </b-button>-->
                      <!--                          <b-button variant="secondary" v-on:click="close()">-->
                      <!--                            close-->
                      <!--                          </b-button>-->
                      <!--                        </template>-->
                      <!--                      </b-modal>-->

                      <!--                      <template v-if="studentSubmission.hasSubmitted">-->
                      <!--                        <b-button variant="link" size="sm"-->
                      <!--                                  v-b-tooltip.hover title="Share"-->
                      <!--                                  v-b-modal="`modal-share-${studentSubmission.submission.entityId}`">-->
                      <!--                          <b-icon icon="share"/>-->
                      <!--                          Share Submission-->
                      <!--                        </b-button>-->
                      <!--                        <modal-share-entity :entity-id="studentSubmission.submission.entityId" :client-id="clientId"-->
                      <!--                                            :modal-id="`modal-share-${studentSubmission.submission.entityId}`"-->
                      <!--                                            title="Share the Submission"/>-->
                      <!--                      </template>-->


                    </div>
                  </b-td>
                </b-tr>
              </b-tbody>
            </b-table-simple>

            <!--            <ul class="submission-ul">-->
            <!--              <li v-for="(submission, submissionIndex) in assignment.submissions" :key="submissionIndex">-->
            <!--                <div v-if="!submission.edit">-->
            <!--                  <div>-->
            <!--                    {{ submission.fullTextJson.text }}-->
            <!--                  </div>-->
            <!--                  <div style="display: flex; flex-direction: row;">-->
            <!--                    <small class="text-left" style="flex: 1;padding-top: 14px;color: #495057;">-->
            <!--                      {{ submission.createdAt }} by-->
            <!--                      <router-link :to="`/tenants/${clientId}/users/${submission.ownerId}`" v-slot="{href, navigate}">-->
            <!--                        <b-link :href="href" v-on:click="navigate">{{ submission.ownerId }}</b-link>-->
            <!--                      </router-link>-->
            <!--                    </small>-->
            <!--                    <div>-->
            <!--                      <b-button variant="link" size="sm" v-if="hasPermission(submission, permissionTypeEditor)"-->
            <!--                                v-on:click="onClickEditEntity(submission)" v-b-tooltip.hover title="Edit">-->
            <!--                        <b-icon icon="pencil"/>-->
            <!--                      </b-button>-->
            <!--                      <b-button variant="link" size="sm" v-if="hasPermission(submission, permissionTypeEditor)"-->
            <!--                                v-b-modal="`modal-submission-share-${submission.entityId}`" v-b-tooltip.hover-->
            <!--                                title="Share">-->
            <!--                        <b-icon icon="share"/>-->
            <!--                      </b-button>-->
            <!--                      <modal-share-entity :entity-id="submission.entityId" :client-id="clientId"-->
            <!--                                          :modal-id="`modal-submission-share-${submission.entityId}`"-->
            <!--                                          title="Share Student's Submission"/>-->

            <!--                      <button-overlay :show="processingDelete[submission.entityId]">-->
            <!--                        <b-button variant="link" size="sm" v-on:click="onClickDelete(submission)"-->
            <!--                                  v-b-tooltip.hover title="Delete">-->
            <!--                          <b-icon icon="trash"/>-->
            <!--                        </b-button>-->
            <!--                      </button-overlay>-->
            <!--                    </div>-->
            <!--                  </div>-->
            <!--                  <ul class="gradings-ul">-->
            <!--                    <li v-for="(grading, gradingIndex) in submission.gradings"-->
            <!--                        :key="gradingIndex">-->
            <!--                      <div v-if="!grading.edit">-->
            <!--                        <div>-->
            <!--                          <strong>Grade : </strong>{{ grading.fullTextJson.grade }}-->
            <!--                        </div>-->
            <!--                        <div>-->
            <!--                          <strong>Comment : </strong>{{ grading.fullTextJson.comment }}-->
            <!--                        </div>-->
            <!--                        <div style="display: flex; flex-direction: row;">-->
            <!--                          <small class="text-left" style="flex: 1;padding-top: 14px;color: #495057;">-->
            <!--                            {{ grading.createdAt }} by-->
            <!--                            <router-link :to="`/tenants/${clientId}/users/${grading.ownerId}`"-->
            <!--                                         v-slot="{href, navigate}">-->
            <!--                              <b-link :href="href" v-on:click="navigate">{{ grading.ownerId }}</b-link>-->
            <!--                            </router-link>-->
            <!--                          </small>-->
            <!--                          <div v-if="hasPermission(grading, permissionTypeEditor)">-->
            <!--                            <b-button variant="link" size="sm" v-on:click="onClickEditEntity(grading)" v-b-tooltip.hover-->
            <!--                                      title="Edit">-->
            <!--                              <b-icon icon="pencil"/>-->
            <!--                            </b-button>-->
            <!--                            <b-button variant="link" size="sm" v-if="hasPermission(grading, permissionTypeEditor)"-->
            <!--                                      v-b-modal="`modal-share-${grading.entityId}`" v-b-tooltip.hover-->
            <!--                                      title="Share">-->
            <!--                              <b-icon icon="share"/>-->
            <!--                            </b-button>-->
            <!--                            <modal-share-entity :entity-id="grading.entityId" :client-id="clientId"-->
            <!--                                                :modal-id="`modal-share-${grading.entityId}`"-->
            <!--                                                title="Share Student's Submission"/>-->

            <!--                            <button-overlay :show="processingDelete[grading.entityId]">-->
            <!--                              <b-button variant="link" size="sm" v-on:click="onClickDelete(grading)"-->
            <!--                                        v-b-tooltip.hover title="Delete">-->
            <!--                                <b-icon icon="trash"/>-->
            <!--                              </b-button>-->
            <!--                            </button-overlay>-->
            <!--                          </div>-->
            <!--                        </div>-->
            <!--                      </div>-->
            <!--                      <div v-else>-->
            <!--                        <div>-->
            <!--                          <b-form-input size="sm" v-model="entitiesMap[grading.entityId].fullTextJson.grade"/>-->
            <!--                          <b-form-input size="sm" v-model="entitiesMap[grading.entityId].fullTextJson.comment"/>-->
            <!--                        </div>-->
            <!--                        <div class="mt-3">-->
            <!--                          <b-button variant="primary" size="sm"-->
            <!--                                    v-on:click="saveGrading(assignment, submission, grading);">-->
            <!--                            Save-->
            <!--                          </b-button>-->
            <!--                        </div>-->
            <!--                      </div>-->
            <!--                    </li>-->
            <!--                  </ul>-->

            <!--                  <b-button-->
            <!--                      v-if="(hasProfessorRole || hasTeachingAssistantRole) && hasPermission(submission, permissionTypeViewer)"-->
            <!--                      variant="link" size="sm"-->
            <!--                      v-on:click="addNewGrading(assignment, submission)">-->
            <!--                    + Create new submission grading-->
            <!--                  </b-button>-->


            <!--                </div>-->
            <!--                <div v-else>-->
            <!--                  <div>-->
            <!--                    <b-form-textarea size="sm" v-model="entitiesMap[submission.entityId].fullTextJson.text"/>-->
            <!--                  </div>-->
            <!--                  <div class="mt-3">-->
            <!--                    <b-button variant="primary" size="sm"-->
            <!--                              v-on:click="saveSubmission(assignment, submission);">-->
            <!--                      Save-->
            <!--                    </b-button>-->
            <!--                  </div>-->
            <!--                </div>-->
            <!--              </li>-->
            <!--            </ul>-->
            <!--            <b-button-->
            <!--                v-if="hasStudentRole && hasPermission(assignment, permissionTypeViewer) && !hasAlreadySubmitted(assignment)"-->
            <!--                variant="link" size="sm"-->
            <!--                v-on:click="addNewSubmission(assignment)">-->
            <!--              + Create new submission-->
            <!--            </b-button>-->
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
const clientRoleTeachingAssistant = config.value('clientRoleTeachingAssistant');
const clientRoleStudent = config.value('clientRoleStudent');

const groupIdStudent = config.value('groupIdStudent');
const groupIdTeachingAssistant = config.value('groupIdTeachingAssistant');

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

      permissionTypeViewer,
      permissionTypeEditor,
      // permissionTypeShare
    }
  },
  computed: {
    title() {
      if (this.hasStudentRole || this.hasTeachingAssistantRole || this.hasProfessorRole) {
        return "Assignments";
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
    students() {
      return this.$store.getters["user/getUsers"]({groupId: groupIdStudent, clientId: this.clientId});
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
    hasTeachingAssistantRole() {
      return this.currentUser && this.currentUser.realmRoles.indexOf(clientRoleTeachingAssistant) >= 0;
    },
    hasStudentRole() {
      return this.currentUser && this.currentUser.realmRoles.indexOf(clientRoleStudent) >= 0;
    }
  },
  methods: {
    mySubmission(assignment) {
      let submission;
      let savedGradings;
      let publishedGradings;
      for (let i = 0; assignment && i < assignment.submissions.length; i++) {
        if (assignment.submissions[i].ownerId === this.currentUsername) {
          submission = assignment.submissions[i];
          savedGradings = submission.gradings.filter(({saved}) => saved);
          publishedGradings = submission.gradings.filter(({saved, fullTextJson: {published}}) => saved && published);
        }
      }

      return {
        studentId: this.currentUsername,
        hasSubmitted: !!submission && submission.saved,
        hasGraded: !!savedGradings && savedGradings.length > 0,
        hasGradePublished: !!publishedGradings && publishedGradings.length > 0,
        submission,
        savedGradings,
        publishedGradings
      }
    },
    studentSubmissions(assignment) {
      const studentSubmissionMap = {};
      for (let i = 0; assignment && i < assignment.submissions.length; i++) {
        const submission = assignment.submissions[i];
        const studentId = assignment.submissions[i].ownerId;
        studentSubmissionMap[studentId] = submission;
      }

      return !this.students ? null : this.students.map(({username}) => {
        const studentId = username;
        const submission = studentSubmissionMap[studentId];
        let savedGradings;
        let publishedGradings;
        if (submission) {
          savedGradings = submission.gradings.filter(({saved}) => saved);
          publishedGradings = submission.gradings.filter(({saved, fullTextJson: {published}}) => saved && published);
        }

        return {
          studentId,
          hasSubmitted: !!submission && submission.saved,
          hasGraded: !!savedGradings && savedGradings.length > 0,
          hasGradePublished: !!publishedGradings && publishedGradings.length > 0,
          submission,
          savedGradings,
          publishedGradings
        }
      });
    },
    hasAlreadySubmitted() {
      // if (assignment && assignment.submissions) {
      //   for (let i = 0; i < assignment.submissions.length; i++) {
      //     if (assignment.submissions[i].ownerId === this.currentUsername) {
      //       return true;
      //     }
      //   }
      //
      //   return false;
      // }

      return false;
    },
    addNewSubmission(assignment) {
      const newSubmissionEntityId = `submission_${window.performance.now()}`;
      this.entitiesMap = {
        ...this.entitiesMap,
        [newSubmissionEntityId]: {
          entityId: newSubmissionEntityId,
          name: newSubmissionEntityId,
          type: entityTypeIdSubmission,
          saved: false,
          edit: true,
          fullTextJson: {
            "assignmentId": assignment.entityId,
            "text": ""
          },
          ownerId: this.currentUsername
        },
        [assignment.entityId]: {
          ...this.entitiesMap[assignment.entityId],
          fullTextJson: {
            ...this.entitiesMap[assignment.entityId].fullTextJson
          }
        }
      };
    },
    closeNewGrading({entityId}) {
      this.entitiesMap = {
        ...this.entitiesMap,
        [entityId]: null
      };
    },
    addNewGrading(assignment, submission) {
      const newGradingEntityId = `grading_${window.performance.now()}`;
      this.entitiesMap = {
        ...this.entitiesMap,
        [newGradingEntityId]: {
          entityId: newGradingEntityId,
          name: newGradingEntityId,
          type: entityTypeIdGrading,
          saved: false,
          edit: true,
          fullTextJson: {
            "assignmentId": assignment.entityId,
            "submissionId": submission.entityId,
            "grade": "",
            "comment": "",
            "published": false
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
          groupIds: [groupIdTeachingAssistant],
          usernames: [assignment.ownerId],
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
          groupIds: [groupIdTeachingAssistant],
          usernames: [assignment.ownerId],
        });
      }

      await this.updateEntity(submission);

      this.refreshData();
    },
    async publishGrading(assignment, submission, grading) {
      this.entitiesMap = {
        ...this.entitiesMap,
        [grading.entityId]: {
          ...this.entitiesMap[grading.entityId],
          fullTextJson: {
            ...this.entitiesMap[grading.entityId].fullTextJson,
            published: true
          }
        }
      };

      await this.updateEntity(grading);
      await this.$store.dispatch("sharing/shareEntity", {
        entityId: grading.entityId,
        clientId: this.clientId,
        permissionTypeId: permissionTypeViewer,
        usernames: [submission.ownerId],
      });

      this.refreshData();
    },
    async updateEntity({entityId}) {
      try {
        const entity = this.entitiesMap[entityId];
        await this.$store.dispatch("entity/updateEntity", {
          entityId: entity.entityId,
          clientId: this.clientId,
          name: entity.name,
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
          name: entity.name,
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
    getSubmissions({assignmentId}) {
      const submissions = [];
      for (const entityId in this.entitiesMap) {
        const entity = this.entitiesMap[entityId];
        if (entity && entity.type === entityTypeIdSubmission && entity.fullTextJson.assignmentId === assignmentId) {
          submissions.push(this.getEntity({entityId}));
        }
      }

      return submissions;
    },
    getGradings({submissionId}) {
      const gradings = [];
      for (const entityId in this.entitiesMap) {
        const entity = this.entitiesMap[entityId];
        if (entity && entity.type === entityTypeIdGrading && entity.fullTextJson.submissionId === submissionId) {
          gradings.push(this.getEntity({entityId}));
        }
      }

      return gradings;
    },
    getEntity({entityId}) {
      let entity = this.entitiesMap[entityId];
      if (!entity) {
        return null;
      } else if (entity.type === entityTypeIdAssignment) {
        entity = {
          ...entity,
          fullTextJson: {
            ...entity.fullTextJson
          },
          submissions: this.getSubmissions({assignmentId: entityId})
        }
      } else if (entity.type === entityTypeIdSubmission) {
        entity = {
          ...entity,
          fullTextJson: {
            ...entity.fullTextJson
          },
          gradings: this.getGradings({submissionId: entityId})
        }
      } else {
        entity = {
          ...entity
        }
      }

      return entity;
    },
    hasPermission({entityId}, permissionTypeId) {
      let status = this.$store.getters["sharing/getUserAccessStatus"]({
        clientId: this.clientId, entityId, permissionTypeId, username: this.currentUsername
      });

      if (status) {
        return status;
      } else {
        if (!status && permissionTypeId === permissionTypeViewer) {
          return this.hasPermission({entityId}, permissionTypeEditor);
        } else {
          return false;
        }
      }
    },
    refreshData() {
      this.$store.dispatch("entity/fetchEntities", {clientId: this.clientId, ownerId: this.currentUsername});
      this.$store.dispatch("user/fetchUsers", {groupId: groupIdStudent, clientId: this.clientId});
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
            permissionTypeId: permissionTypeViewer,
            username: this.currentUsername
          });

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

ul.gradings-ul {
  padding: 0px;
  margin: 0px;
}

ul.gradings-ul > li {
  list-style: none;
  padding: 10px;
  background-color: #e3e3e3;
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