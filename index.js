import { createClient } from "polkadot-api"
import { getSmProvider } from "polkadot-api/sm-provider"
import { chainSpec } from "polkadot-api/chains/polkadot"
import { chainSpec as ksmC } from "polkadot-api/chains/ksmcc3"
import { chainSpec as wndC } from "polkadot-api/chains/westend2"
import { chainSpec as pasC } from "polkadot-api/chains/paseo"
import { startFromWorker } from "polkadot-api/smoldot/from-node-worker"
import { fileURLToPath } from "url"
import { Worker } from "worker_threads"

const workerPath = fileURLToPath(
  import.meta.resolve("polkadot-api/smoldot/node-worker"),
)
const worker = new Worker(workerPath)
const smoldot = startFromWorker(worker, {})

const chains = [wndC, chainSpec, ksmC, pasC].map((chainSpec) =>
  smoldot.addChain({ chainSpec }),
)
const clients = chains.map((chain) => createClient(getSmProvider(chain)))

console.log("waiting for metadatas")
await Promise.all(
  clients.map((c) => c.getUnsafeApi().apis.Metadata.metadata_at_version(15)),
)
console.log("got all metadatas")

clients.forEach((c) => c.destroy())
smoldot.terminate()
