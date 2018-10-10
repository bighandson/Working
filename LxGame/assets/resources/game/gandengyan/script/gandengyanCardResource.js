
const handCard_plist = "handCard.plist";
const outCard_left_plist = "outCard_left.plist"
const outCard_right_plist = "outCard_right.plist"
const outCard_UpDown_plist = "outCard_UpDown.plist"
const wahuaItem_plist = "wahuaItem.plist"

var handCard = null;
var outCard_left = null;
var outCard_right = null;
var outCard_UpDown = null;
var wahuaItem = null;

const MJType = require('MJType');


var loadMJCardsRes = function (cb) {
    cc.loader.loadResDir('game/gandengyan/texture',function (err,asserts) 
    {
        if(err)
        {
            return cb(err);
        }

        asserts.forEach(function (asset) 
        {
            if(asset == null)
            {
                cc.log('asset is null');
                return;
            }

            cc.log('asset._name=',asset._name);
            switch (asset._name)
            {
                case handCard_plist:
                    handCard = asset;
                    break;
                case outCard_left_plist:
                    outCard_left = asset;
                    break;
                case outCard_right_plist:
                    outCard_right = asset;
                    break;
                case outCard_UpDown_plist:
                    outCard_UpDown = asset;
                    break;
                case wahuaItem_plist:
                    wahuaItem = asset;
                    break;
                default:
                    break;
            }
        });

        cb(err);
    });
}

function getCardNameByData(Data)
{
    if( Data >= 0 && Data <= 8 )
    {
        return "{0}".format(Data);
    }
    var cardType = Math.floor(Data/100);
    var cardNum1 =  Math.floor( (Data %100)/10 );
    var cardNum2 = (Data %100)%10;
    var str = "{0}{1}{2}".format(cardType,cardNum1,cardNum2);
    return str;
}

function getCardSoundNameByData(Data)
{
    var cardType = Math.floor(Data/100);
    var cardNum1 =  Math.floor( (Data %100)/10 );
    var cardNum2 = (Data %100)%10;
    var str = "{0}{1}".format(cardNum1,cardNum2);
    return str;
}

function getCardValue(Data)
{
    if( Data >= 0 && Data <= 8 )
    {
        return Data;
    }
    return Data%100;
}

function getCardColor(Data)
{
    return Math.floor(Data/100);
}

function getCardNameByData_Hand( _ChairID ,Data)
{
    let frame = null;
    switch(_ChairID)
    {
        case 0: 
            frame = handCard.getSpriteFrame(getCardNameByData(Data));
            break;
        case 1:
            frame = handCard.getSpriteFrame("right_hand");
            break;
        case 2:
            frame = handCard.getSpriteFrame("oppo_hand");
            break;
        case 3:
            frame = handCard.getSpriteFrame("left_hand");
            break;
        default:
            cc.log("取牌座位号不对");
    }
    return frame; 
	
}

function getCardNameByData_Out(_ChairID,Data)
{
    let frame = null;
    switch(_ChairID)
    {
        case 0:
            frame = outCard_UpDown.getSpriteFrame(getCardNameByData(Data));
            break;
        case 1:
            frame = outCard_right.getSpriteFrame(getCardNameByData(Data));
            break;
        case 2:
            frame = outCard_UpDown.getSpriteFrame(getCardNameByData(Data));
            break;
        case 3:
            frame = outCard_left.getSpriteFrame(getCardNameByData(Data));
            break;
        default:
            cc.log("取牌座位号不对");
            break;
    }
    return frame;
}

function getCardNameByData_CurOut(_ChairID,Data)
{
    return getCardNameByData_Out(_ChairID,Data);
}

function getCardNameByData_Chi(_ChairID,Data)
{
    return getCardNameByData_Out(_ChairID,Data);
}
function getCardNameByData_Gang(_ChairID,Data)
{
    return getCardNameByData_Out(_ChairID,Data);
}
function getCardNameByData_An(_ChairID,Data)
{
    return getCardNameByData_Out(_ChairID,Data);
}

function getwahuaItem()
{
    return wahuaItem;
}

module.exports = {
    // loadMJCardsRes : loadMJCardsRes,
    // getInHandImageByChair : getInHandImageByChair,
    loadMJCardsRes: loadMJCardsRes,
    getwahuaItem:getwahuaItem,
    getCardNameByData_An:getCardNameByData_An,
    getCardNameByData_Chi:getCardNameByData_Chi,
    getCardNameByData_Gang:getCardNameByData_Gang,
    getCardNameByData_CurOut : getCardNameByData_CurOut,
    getCardNameByData_Out : getCardNameByData_Out,
    getCardNameByData_Hand: getCardNameByData_Hand,
    getCardValue:getCardValue,
    getCardColor:getCardColor,
    getCardSoundNameByData:getCardSoundNameByData,
}