/**
 * MiniPay / Celo integration for Asante Drop donations.
 *
 * MiniPay is Opera's stablecoin wallet, built on the Celo blockchain.
 * It injects window.ethereum with isMiniPay=true when the user opens the
 * app inside the MiniPay browser.
 *
 * Donations are sent in cKES (Celo Kenya Shilling) — 1 cKES = 1 KES.
 * The community wallet address is set via VITE_COMMUNITY_WALLET env var.
 */

import {
  createWalletClient,
  createPublicClient,
  custom,
  http,
  parseUnits,
  formatUnits,
  type Address,
} from 'viem';
import { celo, celoAlfajores } from 'viem/chains';

// ── Token addresses ────────────────────────────────────────────────────────
export const CKES_MAINNET: Address = '0x456a3D042C0DbD3db53D5489e98dFb038553B0d0';
export const CUSD_MAINNET: Address = '0x765DE816845861e75A25fCA122bb6898B8B1282a';
export const CKES_TESTNET: Address = '0x1E0433C1769271ECcF4CFF9FDdD515695c57bB51'; // Alfajores

const ERC20_ABI = [
  {
    name: 'transfer',
    type: 'function' as const,
    stateMutability: 'nonpayable' as const,
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'balanceOf',
    type: 'function' as const,
    stateMutability: 'view' as const,
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

// ── Environment ────────────────────────────────────────────────────────────
const IS_TESTNET = import.meta.env.VITE_CELO_ENV === 'testnet';
const CHAIN = IS_TESTNET ? celoAlfajores : celo;
const CKES = IS_TESTNET ? CKES_TESTNET : CKES_MAINNET;
const RPC = IS_TESTNET
  ? 'https://celo-alfajores.publicnode.com'
  : 'https://forno.celo.org';

export const COMMUNITY_WALLET = (
  import.meta.env.VITE_COMMUNITY_WALLET || ''
) as Address;

// ── Detection ──────────────────────────────────────────────────────────────
declare global {
  interface Window {
    ethereum?: {
      isMiniPay?: boolean;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on?: (event: string, handler: (...args: unknown[]) => void) => void;
    };
  }
}

export function isMiniPayBrowser(): boolean {
  return typeof window !== 'undefined' && !!window.ethereum?.isMiniPay;
}

export function isCeloWalletAvailable(): boolean {
  return typeof window !== 'undefined' && !!window.ethereum;
}

// ── Clients ────────────────────────────────────────────────────────────────
function getWalletClient() {
  if (!window.ethereum) throw new Error('No wallet provider found');
  return createWalletClient({ chain: CHAIN, transport: custom(window.ethereum) });
}

function getPublicClient() {
  return createPublicClient({ chain: CHAIN, transport: http(RPC) });
}

// ── Connect ────────────────────────────────────────────────────────────────
export async function connectMiniPay(): Promise<Address> {
  const client = getWalletClient();
  const [address] = await client.requestAddresses();
  return address;
}

// ── Balance ────────────────────────────────────────────────────────────────
export async function getCKESBalance(address: Address): Promise<string> {
  const publicClient = getPublicClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = await (publicClient as any).readContract({
    address: CKES,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address],
  });
  return formatUnits(raw as bigint, 18);
}

// ── Send donation ──────────────────────────────────────────────────────────
export interface DonationResult {
  txHash: string;
  amount: number;
  from: Address;
  to: Address;
  tokenSymbol: string;
}

export async function sendAsanteDrop(amountKES: number): Promise<DonationResult> {
  if (!COMMUNITY_WALLET) throw new Error('Community wallet address not configured (VITE_COMMUNITY_WALLET)');

  const walletClient = getWalletClient();
  const [from] = await walletClient.requestAddresses();

  // cKES has 18 decimals, 1 cKES = 1 KES
  const amountWei = parseUnits(amountKES.toString(), 18);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const txHash = await (walletClient as any).writeContract({
    address: CKES,
    abi: ERC20_ABI,
    functionName: 'transfer',
    args: [COMMUNITY_WALLET, amountWei],
    account: from,
    chain: CHAIN,
  });

  return {
    txHash: txHash as string,
    amount: amountKES,
    from,
    to: COMMUNITY_WALLET,
    tokenSymbol: 'cKES',
  };
}

// ── Explorer link ──────────────────────────────────────────────────────────
export function celoExplorerTx(txHash: string): string {
  const base = IS_TESTNET
    ? 'https://alfajores.celoscan.io/tx/'
    : 'https://celoscan.io/tx/';
  return `${base}${txHash}`;
}
