import { Address, BigInt, Bytes, json } from "@graphprotocol/graph-ts";
import {
  Account,
  DailyBalance,
  DailyDelagate,
  DailySubDelegation,
  Delegate,
  ProxyAddress,
  SubDelegationEntity,
  SubDelegator,
} from "../generated/schema";
import { AlligatorOPV5 } from "../generated/AlligatorOPV5/AlligatorOPV5";

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export class SubDelegationRuleObject {
  maxRedelegations: i32;
  blocksBeforeVoteCloses: i32;
  notValidBefore: BigInt;
  notValidAfter: BigInt;
  customRule: Address;
  allowanceType: i32;
  allowance: BigInt;

  constructor() {
    this.maxRedelegations = 0;
    this.blocksBeforeVoteCloses = 0;
    this.notValidBefore = new BigInt(0);
    this.notValidAfter = new BigInt(0);
    this.customRule = Address.fromString(ZERO_ADDRESS);
    this.allowanceType = 0;
    this.allowance = new BigInt(0);
  }
}

export function getAccount(address: Address): Account {
  let accountId = address.toHex();
  let account = Account.load(accountId);
  if (account == null) {
    account = new Account(accountId);
    account.address = address.toHex();
    account.balance = new BigInt(0);
  }
  return account;
}

export function updateAccountBalance(address: Address, value: BigInt): void {
  let account = getAccount(address);
  account.balance = account.balance.plus(value);
  account.save();
}

export function getDelegate(address: Address): Delegate {
  let delegateId = address.toHex();
  let delegate = Delegate.load(delegateId);
  if (delegate == null) {
    delegate = new Delegate(delegateId);
    delegate.address = address.toHex();
    delegate.directVotingPower = new BigInt(0);
  }
  return delegate;
}

export function updateDelegateVotingPower(
  address: Address,
  value: BigInt
): void {
  let delegate = getDelegate(address);
  delegate.directVotingPower = delegate.directVotingPower.plus(value);
  delegate.save();
}

export function getDailyDelegate(
  address: Address,
  timestamp: BigInt
): DailyDelagate {
  const timestampInt = timestamp.toI32();
  let dayId = timestampInt / 86400;
  let startTimestamp = dayId * 86400;
  const dailyDelegateId = `${address.toHex()}-${dayId.toString()}`;
  let dailyDelegate = DailyDelagate.load(dailyDelegateId);
  if (dailyDelegate == null) {
    dailyDelegate = new DailyDelagate(dailyDelegateId);
    dailyDelegate.delegate = address.toHex();
    dailyDelegate.date = startTimestamp;
    dailyDelegate.directVotingPower = new BigInt(0);
  }
  return dailyDelegate;
}

export function getDailyBalance(
  address: Address,
  timestamp: BigInt
): DailyBalance {
  const timestampInt = timestamp.toI32();
  let dayId = timestampInt / 86400;
  let startTimestamp = dayId * 86400;
  const dailyBalanceId = `${address.toHex()}-${dayId.toString()}`;
  let dailyBalance = DailyBalance.load(dailyBalanceId);
  if (dailyBalance == null) {
    dailyBalance = new DailyBalance(dailyBalanceId);
    dailyBalance.account = address.toHex();
    dailyBalance.date = startTimestamp;
    dailyBalance.balance = new BigInt(0);
  }
  return dailyBalance;
}

export function updateDailyBalance(address: Address, timestamp: BigInt): void {
  let dailyBalance = getDailyBalance(address, timestamp);
  const account = getAccount(address);
  dailyBalance.balance = account.balance;
  dailyBalance.save();
}

export function getProxyAddress(
  address: Address,
  contractAddress: Address
): ProxyAddress {
  let proxyAddressId = address.toHex();
  let proxyAddress = ProxyAddress.load(proxyAddressId);
  if (proxyAddress == null) {
    const contract = AlligatorOPV5.bind(contractAddress);
    const proxy = contract.proxyAddress(address);
    proxyAddress = new ProxyAddress(proxyAddressId);
    proxyAddress.address = address.toHex();
    proxyAddress.proxy = proxy.toHex();
    proxyAddress.save();
  }
  return proxyAddress;
}

export function getSubDelegator(from: Address, to: Address): SubDelegator {
  let subdelegatorId = `${from.toHex()}-${to.toHex()}`;
  let subdelegator = SubDelegator.load(subdelegatorId);
  if (subdelegator == null) {
    subdelegator = new SubDelegator(subdelegatorId);
    subdelegator.from = from.toHex();
    subdelegator.to = to.toHex();
  }
  return subdelegator;
}

export function getDailySubDelegation(
  fromAddress: Address,
  toAddress: Address,
  timestamp: BigInt
): DailySubDelegation {
  let timestampInt = timestamp.toI32();
  let dayId = timestampInt / 86400;
  let startTimestamp = dayId * 86400;
  let dailySubDelegationId = `${fromAddress.toHex()}-${toAddress.toHex()}-${dayId.toString()}`;
  let dailySubDelegation = DailySubDelegation.load(dailySubDelegationId);
  if (dailySubDelegation == null) {
    dailySubDelegation = new DailySubDelegation(dailySubDelegationId);
    dailySubDelegation.from = fromAddress.toHex();
    dailySubDelegation.to = toAddress.toHex();
    dailySubDelegation.date = startTimestamp;
  }
  return dailySubDelegation;
}

export function recordSubDelegation(
  fromAddress: Address,
  toAddress: Address,
  rule: SubDelegationRuleObject,
  contractAddress: Address,
  blockNumber: BigInt,
  blockTimestamp: BigInt,
  transactionHash: Bytes
): void {
  // update proxy address
  getProxyAddress(fromAddress, contractAddress);
  // save subdelegation entity
  const entityId = `${transactionHash.toHex()}-${blockNumber.toString()}`;
  let entity = new SubDelegationEntity(entityId);
  entity.from = fromAddress.toHex();
  entity.to = toAddress.toHex();
  entity.maxRedelegations = rule.maxRedelegations;
  entity.blocksBeforeVoteCloses = rule.blocksBeforeVoteCloses;
  entity.notValidBefore = rule.notValidBefore;
  entity.notValidAfter = rule.notValidAfter;
  entity.customRule = rule.customRule.toHex();
  entity.allowanceType = rule.allowanceType;
  entity.allowance = rule.allowance;
  entity.blockNumber = blockNumber;
  entity.blockTimestamp = blockTimestamp;
  entity.transactionHash = transactionHash.toHex();
  entity.save();
  // update subdelegation rule
  let subdelegator = getSubDelegator(fromAddress, toAddress);
  subdelegator.maxRedelegations = rule.maxRedelegations;
  subdelegator.blocksBeforeVoteCloses = rule.blocksBeforeVoteCloses;
  subdelegator.notValidBefore = rule.notValidBefore;
  subdelegator.notValidAfter = rule.notValidAfter;
  subdelegator.customRule = rule.customRule.toHex();
  subdelegator.allowanceType = rule.allowanceType;
  subdelegator.allowance = rule.allowance;
  subdelegator.save();
  // update daily subdelegation
  let delegate = getDelegate(toAddress);
  delegate.save();
  let dailySubDelegation = getDailySubDelegation(
    fromAddress,
    toAddress,
    blockTimestamp
  );
  dailySubDelegation.maxRedelegations = rule.maxRedelegations;
  dailySubDelegation.blocksBeforeVoteCloses = rule.blocksBeforeVoteCloses;
  dailySubDelegation.notValidBefore = rule.notValidBefore;
  dailySubDelegation.notValidAfter = rule.notValidAfter;
  dailySubDelegation.customRule = rule.customRule.toHex();
  dailySubDelegation.allowanceType = rule.allowanceType;
  dailySubDelegation.allowance = rule.allowance;
  dailySubDelegation.save();
}
