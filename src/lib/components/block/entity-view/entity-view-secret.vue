<template>
  <div>
    <div style="flex: 1;" class="ml-2">
      <label class="form-label" for="passphrase">Passphrase</label>
      <b-form-textarea
          v-model="entity.ext.passphrase"
          id="passphrase"
          trim
          size="sm"
          readonly>
      </b-form-textarea>
      <b-form-invalid-feedback>
      </b-form-invalid-feedback>
    </div>

    <div style="flex: 1;" class="ml-2">
      <label class="form-label" for="public_key">Public Key</label>
      <b-form-textarea
          v-model="entity.ext.public_key"
          id="public_key"
          trim
          size="sm"
          readonly
          style="min-height: 100px;">
      </b-form-textarea>
      <b-form-invalid-feedback>
      </b-form-invalid-feedback>
    </div>

    <div style="flex: 1;" class="ml-2">
      <label class="form-label" for="private_key">Private Key</label>
      <b-form-textarea
          v-model="entity.ext.private_key"
          id="private_key"
          trim
          size="sm"
          readonly
          style="min-height: 300px;">
      </b-form-textarea>
      <b-form-invalid-feedback>
      </b-form-invalid-feedback>
    </div>

  </div>
</template>

<script>
import store from "../../../store";

export default {
  name: "entity-view-secret",
  store: store,
  props: {
    clientId: {},
    entityId: {}
  },
  computed: {
    entity() {
      return this.$store.getters["entity/getEntity"]({entityId: this.entityId})
    }
  }
}
</script>

<style scoped>

</style>