import { getFormBodyFromJSON, invokeAPIEndpoint } from './lib'
  
export const callUntitledAPIEndpoint = async (publishableKey: string, params: { name : string }) => {
  const form = getFormBodyFromJSON(params);
  return invokeAPIEndpoint<string>("7a11-68-199-153-76.ngrok.io", publishableKey, "apie_3xhPZnPsX38dJZTR5HHuX2", form)
}