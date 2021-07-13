import CustosService from "../index";
import CustosServiceEntitiesSecretsSSH from "./custos-service-entities-secrets-ssh";

export default class CustosServiceEntitiesSecrets {
    /**
     * @type {CustosService}
     */
    _custosService = null;

    /**
     * @type {CustosServiceEntitiesSecretsSSH}
     */
    _ssh = null;

    constructor(custosService) {
        this._custosService = custosService;
        this._ssh = new CustosServiceEntitiesSecretsSSH(this.custosService)
    }

    get custosService() {
        return this._custosService;
    }

    get ssh() {
        return this._ssh;
    }

    getSecretModel({type}) {
        if (type === "SSH") {
            return this.ssh;
        }
    }

    async createSecret({clientId, description, ownerId, type = "SSH"}) {
        return this.getSecretModel({type}).createSecret({clientId, description, ownerId});
    }

    async getSecret({clientId, entityId, type = "SSH"}) {
        return this.getSecretModel({type}).getSecret({clientId, entityId});
    }

    async getSecretMetadata({clientId, entityId = []}) {
        const axiosInstance = await this.custosService.getAxiosInstanceWithClientAuthorization({clientId});
        const {data: {metadata}} = await axiosInstance.get(
            `${CustosService.ENDPOINTS.SECRETS}/secret/summaries`,
            {
                params: {
                    client_id: clientId,
                    accessible_tokens: entityId
                }
            }
        );

        return metadata[0];
    }
}
