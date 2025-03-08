import allServers from "@/public/servers.json";
import Footer from "@/components/footer";
import Link from "next/link";
import ServerContent from "../../../components/server-content";

// Add this function to generate static paths for all servers
export async function generateStaticParams() {
  return allServers.map((server: any) => ({
    key: server.key,
  }));
}

export default function ServerDetails({ params }: { params: { key: string } }) {
  const server = allServers.find((s: any) => s.key === params.key);

  if (!server) {
    return <div>Server not found</div>;
  }

  return (
    <div className="p-5 mx-auto max-w-4xl">
      <header className="mb-10">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-gray-500 hover:text-gray-700">
            ← Back
          </Link>
          <h1 className="text-3xl font-bold">{server.name || server.key}</h1>
        </div>
      </header>

      <ServerContent server={server} />

      <Footer />
    </div>
  );
}
