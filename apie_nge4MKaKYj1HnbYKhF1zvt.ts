import { getFormBodyFromJSON, invokeAPIEndpoint } from './lib'
  
export const callOneAss = async (publishableKey: string, params: { name : string }) => {
  const form = getFormBodyFromJSON(params);
  return invokeAPIEndpoint<string>("8616-68-199-153-76.ngrok.io", publishableKey, "apie_nge4MKaKYj1HnbYKhF1zvt", form)
}