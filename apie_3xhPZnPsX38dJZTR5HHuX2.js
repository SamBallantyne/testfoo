var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getFormBodyFromJSON, invokeAPIEndpoint } from './lib';
export const callUntitledAPIEndpoint = (publishableKey, params) => __awaiter(void 0, void 0, void 0, function* () {
    const form = getFormBodyFromJSON(params);
    return invokeAPIEndpoint("8616-68-199-153-76.ngrok.io", publishableKey, "apie_3xhPZnPsX38dJZTR5HHuX2", form);
});
