var pokers_s_plist = "pokers_s.plist"
var pokers_s = null

var pokers_plist = "pokers.plist"
var pokers = null

var gdyitem_plist = "gdyitem.plist"
var gdyitem = null

var loadGDYCardsRes = function (cb) 
{
    cc.loader.loadResDir('style/poker/texture',function (err,asserts) 
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
                // case pokers_s_plist:
                //     pokers_s = asset;
                //     break;
                case pokers_plist:
                    pokers = asset;
                    break;
                case gdyitem_plist:
                    gdyitem = asset;
                    break
                default:
                    break;
            }
        });

        cb();
    })
}

function getgdyitem()
{
    return gdyitem
}
function getCardFileNameByCardData(_Data)
{
    var Value = getCardValue(_Data)
    var Color = getCardColor(_Data)
    var num = ""
    if(Value == 14){
        Value = 1;
    }
    if(Value == 16){
        Value = 2;
    }
    if( Color == 2 || Color == 4 )
    {
       num = "num_black_{0}".format(Value)
    }
    else
    {
        num = "num_red_{0}".format(Value)
    }
    var smallColor = "colour_s_{0}".format(5-Color)
    var bigColor = "colour_{0}".format(5-Color)
    return {num:num,smallColor:smallColor,bigColor:bigColor}
}

function getCardValue(_Data)
{
    if( _Data <= 100 )
    {
        return _Data
    }
    return _Data % 100
}

function getCardColor(_Data)
{
    if( _Data <= 100 )
    {
        return 0
    }
    return Math.floor( _Data / 100)
}

function getCardSpriteFrame_CardData(_Data)
{
    var CardFileName = getCardFileNameByCardData(_Data)
    var num = pokers.getSpriteFrame(CardFileName.num)
    var smallColor = pokers.getSpriteFrame(CardFileName.smallColor)
    var bigColor = pokers.getSpriteFrame(CardFileName.bigColor)
    return {num:num,smallColor:smallColor,bigColor:bigColor}
}

function getCardSpriteFrame_Back()
{
    return pokers.getSpriteFrame("card_back")
}

function getCardSpriteFrame_Front()
{
    return pokers.getSpriteFrame("card_thrown")
}

function getCardSpriteFrame_King( SmallKing )
{
    var num = null
    var bigColor = null
    if( SmallKing == true )
    {
        num = pokers.getSpriteFrame("joker_num_1")
        bigColor = pokers.getSpriteFrame("joker_1")
    }
    else
    {
        num = pokers.getSpriteFrame("joker_num_2")
        bigColor = pokers.getSpriteFrame("joker_2")
    }
    return  {num:num, bigColor:bigColor}
}

module.exports = 
{
    loadGDYCardsRes:loadGDYCardsRes,
    getgdyitem:getgdyitem,
    getCardValue,getCardValue,
    getCardColor,getCardColor,
    getCardSpriteFrame_Back,getCardSpriteFrame_Back,
    getCardSpriteFrame_King,getCardSpriteFrame_King,
    getCardSpriteFrame_CardData,getCardSpriteFrame_CardData,
}