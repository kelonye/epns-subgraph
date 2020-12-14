import {BigInt, Bytes, ipfs, json, log} from '@graphprotocol/graph-ts'
import {
  Contract,
  AddChannel,
  DeactivateChannel,
  Donation,
  InterestClaimed,
  PublicKeyRegistered,
  SendNotification,
  Subscribe,
  Unsubscribe,
  UpdateChannel,
  Withdrawal,
} from '../generated/Contract/Contract'
import {Channel, SubscriptionState, Notification} from '../generated/schema'

// channel

export function handleAddChannel(event: AddChannel): void {
  let channel = new Channel(event.params.channel.toHex())

  let result = ipfs.cat(getIpfsId(event.params.identity))!
  if (result) {
    let ipfsObject = json.fromBytes(result).toObject()
    channel.name = ipfsObject.get('name').toString()
    channel.info = ipfsObject.get('info').toString()
    channel.url = ipfsObject.get('url').toString()
    channel.icon = ipfsObject.get('icon').toString()
  } else {
    log.warning('channel identity not found in ipfs {}', [
      event.params.identity.toString(),
    ])
  }

  let contract = Contract.bind(event.address)
  let c = contract.channels(event.params.channel)

  channel.type = c.value0 as BigInt
  channel.deactivated = false // c.value1
  channel.poolContribution = c.value2.toI32() as BigInt
  channel.memberCount = c.value3.toI32() as BigInt
  channel.historicalZ = c.value4.toI32() as BigInt
  channel.fairShareCount = c.value5.toI32() as BigInt
  channel.lastUpdateBlock = c.value6.toI32() as BigInt
  channel.startBlock = c.value7.toI32() as BigInt
  channel.updateBlock = c.value8.toI32() as BigInt
  channel.weight = c.value9.toI32() as BigInt

  channel.save()
}

export function handleUpdateChannel(event: UpdateChannel): void {
  let channel = Channel.load(event.params.channel.toHex())
  if (channel === null) {
    log.error('unknown channel {}', [event.params.channel.toHex()])
    return
  }
  let result = ipfs.cat(event.params.identity.toString().split('+')[0])!
  if (result) {
    let ipfsObject = json.fromBytes(result).toObject()
    channel.name = ipfsObject.get('name').toString()
    channel.info = ipfsObject.get('info').toString()
    channel.url = ipfsObject.get('url').toString()
    channel.icon = ipfsObject.get('icon').toString()
  }

  let contract = Contract.bind(event.address)
  let c = contract.channels(event.params.channel)

  // channel.poolContribution = c.value2.toI32() as BigInt
  // channel.memberCount = c.value3.toI32() as BigInt
  // channel.historicalZ = c.value4.toI32() as BigInt
  // channel.fairShareCount = c.value5.toI32() as BigInt
  // channel.lastUpdateBlock = c.value6.toI32() as BigInt
  // channel.startBlock = c.value7.toI32() as BigInt
  channel.updateBlock = c.value8.toI32() as BigInt
  // channel.weight = c.value9.toI32() as BigInt

  channel.save()
}

// subscription

export function handleSubscribe(event: Subscribe): void {
  let subscriptionId = getSubscriptionStateId(
    event.params.channel.toHexString(),
    event.params.user.toHexString()
  )
  let subscription = SubscriptionState.load(subscriptionId)
  if (subscription == null) {
    subscription = new SubscriptionState(subscriptionId)
    subscription.channelAddress = event.params.channel
    subscription.userAddress = event.params.user
  }
  subscription.subscribed = true
  subscription.save()
}

export function handleUnsubscribe(event: Unsubscribe): void {
  let subscriptionId = getSubscriptionStateId(
    event.params.channel.toHexString(),
    event.params.user.toHexString()
  )
  let subscription = SubscriptionState.load(subscriptionId)
  if (subscription == null) {
    subscription = new SubscriptionState(subscriptionId)
    subscription.channelAddress = event.params.channel
    subscription.userAddress = event.params.user
  }
  subscription.subscribed = false
  subscription.save()
}

function getSubscriptionStateId(channel: string, user: string): string {
  return channel.concat('+').concat(user)
}

// notification

export function handleSendNotification(event: SendNotification): void {
  let notification = new Notification(event.transaction.from.toHex())
  notification.channelAddress = event.params.channel
  notification.userAddress = event.params.recipient
  let result = ipfs.cat(getIpfsId(event.params.identity))!
  if (result) {
    let ipfsObject = json.fromBytes(result).toObject()
    let n = ipfsObject.get('notification').toObject()
    let d = ipfsObject.get('data').toObject()
    notification.notificationTitle = n.get('title').toString()
    notification.notificationBody = n.get('body').toString()
    notification.dataType = d.get('type').toString()
    notification.dataSecret = d.get('secret').toString()
    notification.dataASub = d.get('asub').toString()
    notification.dataAMsg = d.get('amsg').toString()
    notification.dataACta = d.get('acta').toString()
    notification.dataAImg = d.get('aimg').toString()
    notification.dataATime = d.get('atime').toString()
  } else {
    log.warning('notification identity not found in ipfs {}', [
      event.params.identity.toString(),
    ])
  }
  notification.save()
}

function getIpfsId(s: Bytes): string {
  return s.toString().split('+')[1]
}

//

export function handleDeactivateChannel(event: DeactivateChannel): void {
  let channel = Channel.load(event.params.channel.toHex())
  if (channel === null) {
    log.error('unknown channel {}', [event.params.channel.toHex()])
    return
  }
  channel.deactivated = true
  channel.save()
}

export function handleDonation(event: Donation): void {}

export function handleInterestClaimed(event: InterestClaimed): void {}

export function handlePublicKeyRegistered(event: PublicKeyRegistered): void {}

export function handleWithdrawal(event: Withdrawal): void {}
