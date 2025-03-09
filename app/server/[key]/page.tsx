import { getAllServers, getServerByKey } from "@/lib/serverUtils";
import Footer from "@/components/footer";
import Link from "next/link";
import ServerContent from "../../../components/server-content";

// Configure dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Add this function to generate static paths for all servers
export async function generateStaticParams() {
  const servers = await getAllServers();
  return servers.map((server: any) => ({
    key: server.key,
  }));
}

interface PageProps {
  params: Promise<{ key: string }>;
}

export default async function Page({ params }: PageProps) {
  // Await the params object before accessing its properties
  const key = (await params).key;
  const server = await getServerByKey(key);

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
          {/* <h1 className="text-3xl font-bold">{server.name || server.key}</h1> */}
        </div>
      </header>

      <ServerContent server={server} />

      <Footer />
    </div>
  );
}
