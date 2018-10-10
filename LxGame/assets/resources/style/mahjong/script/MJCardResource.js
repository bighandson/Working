
const cards_back_flowers_plist = 'card_hands.plist';
const myoutcard_plist = 'myoutcard.plist';
const myhandcard_plist = 'MJ.plist';
const myeat_plist = 'My_Eat.plist';
const rightplayercard_plist = 'rightplayercard.plist';
const leftplayercard_plist = 'leftplayercard.plist';

var cards_back_flowers = null;
var myoutcard = null;
var myhandcard = null;
var myeat = null;
var rightplayercard = null;
var leftplayercard = null;

const MJType = require('MJType');

const Mahjong_eat = [
    'bottom_{0}'
];

const Mahjong_hand = [
    'MJ-{0}',
    'hand_card_right',
    'top_hand',
    'hand_card_left'
];

const Mahjong_out = [
    'MyOut-{0}',
    'rpout-{0}',
    'MyOut-{0}',
    'pout-{0}'
];

const Mahjong_an = [
    'MJ_an',
    'rightplayercard_an',
    'MJ_an',
    'leftplayercard_an'
];

var loadMJCardsRes = function (cb) {
    cc.log('loadMJCardsRes')
    cc.loader.loadResDir('style/mahjong/MJCards',function (err,asserts) {
        if(err){
            cc.log(err)
            return cb(err);
        }

        asserts.forEach(function (asset) {
            if(asset == null){
                cc.log('asset is null');
                return;
            }

            // cc.log('asset._name=',asset._name);
            switch (asset._name){
                case cards_back_flowers_plist:
                    cards_back_flowers = asset;
                    break;
                case myoutcard_plist:
                    myoutcard = asset;
                    break;
                case myhandcard_plist:
                    myhandcard = asset;
                    break;
                case rightplayercard_plist:
                    rightplayercard = asset;
                    break;
                case leftplayercard_plist:
                    leftplayercard = asset;
                    break;
                case myeat_plist:
                    myeat = asset;
                    break;
                default:
                    break;
            }
        });
        cc.log('loadMJCardsRes',err)
        cb(err);
    });
}

/**
 * 通过座位和麻将的值来获取手牌图片的路径
 * @param chair
 * @param value
 */
function getInHandImageByChair(chair,value) {
    let frame = null;
    value = stSwitch(parseInt(value));
    switch (chair){
        case 0:
            if(MJType.isFlower(value)){  // 花牌
                frame = cards_back_flowers.getSpriteFrame('MJ0x{0}'.format(value));
            }else {
                frame = myhandcard.getSpriteFrame(Mahjong_hand[chair].format(value-1));
            }

            break;
        case 1:
            frame = cards_back_flowers.getSpriteFrame(Mahjong_hand[chair]);
            break;
        case 2:
            frame = cards_back_flowers.getSpriteFrame(Mahjong_hand[chair]);
            break;
        case 3:
            frame = cards_back_flowers.getSpriteFrame(Mahjong_hand[chair]);
            break;
        default:
            //return null;
            break;
    }

    return frame;
}

function getExtraImageByChair(chair, value, cpg) {
    let frame = null;
    value = stSwitch(parseInt(value));
    switch (chair) {
        case 0:
            if (MJType.isFlower(value)) {  // 花牌
                frame = cards_back_flowers.getSpriteFrame('myoutcard0x{0}'.format(value));
            } else {
                if (!!cpg) {
                    frame = myeat.getSpriteFrame(Mahjong_eat[0].format(value - 1));
                } else {
                    frame = myoutcard.getSpriteFrame(Mahjong_out[chair].format(value - 1));
                }

            }
            break;
        case 1:
            if (MJType.isFlower(value)){  // 花牌
            frame = cards_back_flowers.getSpriteFrame('rightplayercard0x{0}'.format(value));
          }else {

            frame = rightplayercard.getSpriteFrame(Mahjong_out[chair].format(value-1));
          }
          break;
      case 2:
      if(MJType.isFlower(value)){  // 花牌
        frame = cards_back_flowers.getSpriteFrame('myoutcard0x{0}'.format(value));
      }else {
          if(!!cpg){
              if(cpg == 2){
                frame = myoutcard.getSpriteFrame(Mahjong_out[0].format(value-1));
              }
              if(cpg == 1){
                 frame = myeat.getSpriteFrame(Mahjong_eat[0].format(value-1));
              }
           
          }else{
            frame = myoutcard.getSpriteFrame(Mahjong_out[0].format(value-1));
          }
        
      }
          break;
      case 3:
      if(MJType.isFlower(value)){  // 花牌
        frame = cards_back_flowers.getSpriteFrame('leftplayercard0x{0}'.format(value));
      }else {
        frame = leftplayercard.getSpriteFrame(Mahjong_out[chair].format(value-1));
      }
      default:
          //return null;
          break;
  }

  return frame;
}

function getAnFrame(chair,result){
  let frame = null;
  let key = ['MJ_an','rightplayercard_an','MJ_an','leftplayercard_an'];
  if(!!result){
      key = ['top_backstand','rightplayercard_an','MJ_an','leftplayercard_an'];
  }
  frame = cards_back_flowers.getSpriteFrame(key[chair]);
  return frame;
}

/**
 * 筒条转换
 * @param value
 */
function stSwitch(value) {
    if(MJType.paiType(value) == 2){  // 筒
        return value + 9;
    }else if(MJType.paiType(value) == 3){ // 锁
        return value - 9;
    }

    return value;
}

module.exports = {
    loadMJCardsRes : loadMJCardsRes,
    getInHandImageByChair : getInHandImageByChair,
    getExtraImageByChair : getExtraImageByChair,
    getAnFrame : getAnFrame
}
