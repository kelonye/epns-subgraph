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

  // let contract = Contract.bind(event.address)
  // let c = contract.channels(event.params.channel)

  // channel.type = c.value0 as BigInt
  // channel.deactivated = false // c.value1
  // channel.poolContribution = c.value2.toI32() as BigInt
  // channel.memberCount = c.value3.toI32() as BigInt
  // channel.historicalZ = c.value4.toI32() as BigInt
  // channel.fairShareCount = c.value5.toI32() as BigInt
  // channel.lastUpdateBlock = c.value6.toI32() as BigInt
  // channel.startBlock = c.value7.toI32() as BigInt
  // channel.updateBlock = c.value8.toI32() as BigInt
  // channel.weight = c.value9.toI32() as BigInt

  channel.type = new BigInt(0)
  channel.deactivated = false
  channel.poolContribution = new BigInt(0)
  channel.memberCount = new BigInt(0)
  channel.historicalZ = new BigInt(0)
  channel.fairShareCount = new BigInt(0)
  channel.lastUpdateBlock = new BigInt(0)
  channel.startBlock = new BigInt(0)
  channel.updateBlock = new BigInt(0)
  channel.weight = new BigInt(0)

  channel.save()
}

export function handleUpdateChannel(event: UpdateChannel): void {
  let channel = Channel.load(event.params.channel.toHex())
  if (channel === null) {
    log.warning('unknown channel {}', [event.params.channel.toHex()])
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

  // let contract = Contract.bind(event.address)
  // let c = contract.channels(event.params.channel)

  // channel.poolContribution = c.value2.toI32() as BigInt
  // channel.memberCount = c.value3.toI32() as BigInt
  // channel.historicalZ = c.value4.toI32() as BigInt
  // channel.fairShareCount = c.value5.toI32() as BigInt
  // channel.lastUpdateBlock = c.value6.toI32() as BigInt
  // channel.startBlock = c.value7.toI32() as BigInt
  // channel.updateBlock = c.value8.toI32() as BigInt
  // channel.weight = c.value9.toI32() as BigInt

  channel.save()
}

export function handleDeactivateChannel(event: DeactivateChannel): void {
  let channel = Channel.load(event.params.channel.toHex())
  if (channel === null) {
    log.warning('unknown channel {}', [event.params.channel.toHex()])
    return
  }
  channel.deactivated = true
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

  let channel = Channel.load(event.params.channel.toHex())
  if (channel === null) {
    log.warning('unknown channel {}', [event.params.channel.toHex()])
    return
  }

  let contract = Contract.bind(event.address)
  let c = contract.try_channels(event.params.channel)
  if (c.reverted) {
    log.warning('.channels reverted', [])
  } else {
    channel.memberCount = c.value.value3
  }

  channel.save()
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

  let channel = Channel.load(event.params.channel.toHex())
  if (channel === null) {
    log.warning('unknown channel {}', [event.params.channel.toHex()])
    return
  }

  let contract = Contract.bind(event.address)
  let c = contract.try_channels(event.params.channel)
  if (c.reverted) {
    log.warning('.channels reverted', [])
  } else {
    channel.memberCount = c.value.value3
  }

  channel.save()
}

function getSubscriptionStateId(channel: string, user: string): string {
  return channel.concat('+').concat(user)
}

// notification

export function handleSendNotification(event: SendNotification): void {
  let notification = new Notification(event.params.identity.toHex())
  notification.channelAddress = event.params.channel
  notification.userAddress = event.params.recipient
  let result = ipfs.cat(getIpfsId(event.params.identity))!
  if (result) {
    let ipfsObject = json.fromBytes(result).toObject()

    let n = ipfsObject.get('notification').toObject()
    notification.notificationTitle = n.get('title').toString()
    notification.notificationBody = n.get('body').toString()

    let dValue = ipfsObject.get('data')
    if (dValue !== null) {
      let d = dValue.toObject()
      let asub = d.get('asub')
      if (asub !== null) {
        notification.dataASub = asub.toString()
      }
      let amsg = d.get('amsg')
      if (amsg !== null) {
        notification.dataAMsg = amsg.toString()
      }
      let acta = d.get('acta')
      if (acta !== null) {
        notification.dataACta = acta.toString()
      }
      let aimg = d.get('aimg')
      if (aimg !== null) {
        notification.dataAImg = aimg.toString()
      }
      let atime = d.get('atime')
      if (atime !== null) {
        notification.dataATime = atime.toString()
      }
    }
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

export function handleDonation(event: Donation): void {}

export function handleInterestClaimed(event: InterestClaimed): void {}

export function handlePublicKeyRegistered(event: PublicKeyRegistered): void {}

export function handleWithdrawal(event: Withdrawal): void {}
