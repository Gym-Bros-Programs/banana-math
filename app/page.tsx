import DeployButton from "../components/DeployButton";
import AuthButton from "../components/AuthButton";
import { createClient } from "@/utils/supabase/server";
import Header from "@/components/Header";
import MonkeyMath from "@/components/BananaMath/MonkeyMath";
import Navbar from '../components/Navbar';
import Footer from "@/components/Footer";

const TEXT_CLASS = "text-zinc-400 hover:text-zinc-200";

export default async function Index() {
  const canInitSupabaseClient = () => {
    // This function is just for the interactive tutorial.
    // Feel free to remove it once you have Supabase connected.
    try {
      createClient();
      return true;
    } catch (e) {
      return false;
    }
  };

  const isSupabaseConnected = canInitSupabaseClient();

  return (
    <div className="flex flex-1 w-full flex-col items-center justify-between bg-zinc-800 px-10 py-6">
      <Navbar isSupabaseConnected={isSupabaseConnected} />
      <MonkeyMath />
      <Footer />
    </div>
  );
}
