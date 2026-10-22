import { getFunctionErrorMessage } from "@/lib/paystack";
import { supabase } from "@/lib/supabase";

export async function saveDispatchDriver(input: {
  name: string;
  phone: string;
}) {
  const { data, error } = await supabase.functions.invoke("assign-order", {
    body: { action: "register_driver", ...input },
  });
  if (error) {
    throw new Error(await getFunctionErrorMessage(error));
  }
  if (data?.error) {
    throw new Error(data.error);
  }
  if (!data?.driver) {
    throw new Error("WhatsApp driver was not saved.");
  }
  return data.driver as {
    id: string;
    name: string;
    phone: string;
    is_active: boolean;
  };
}
