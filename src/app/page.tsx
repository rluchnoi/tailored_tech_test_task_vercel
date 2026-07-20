import { DataRoomProvider } from "@/components/data-room/data-room-provider";
import { DataRoomShell } from "@/components/data-room/data-room-shell";

export default function Home() {
  return (
    <DataRoomProvider>
      <DataRoomShell />
    </DataRoomProvider>
  );
}
