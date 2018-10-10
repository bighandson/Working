var GDYCardRes = require("GDYCardRes")
var GDYCMD = require("GDYCMD")

var CardKind = 
{
    SingleCards :[],
    DoubleCards :[],
    ThreeCards  :[],
    FourCards   :[],
    Kings       :[],
}
CardKind.Clean = function()
{
    CardKind.SingleCards=[];
    CardKind.DoubleCards=[];
    CardKind.ThreeCards=[];
    CardKind.FourCards=[];
    CardKind.Kings=[];
}


var GameLogic = 
{

}

GameLogic.AnalyzeCard = function(TotalCard)
{
    GameLogic.SortCard(TotalCard)
    var RltCard = {}
    var CardValues = [16,14,13,12,11,10,9,8,7,6,5,4,3]
    for(var j=0; j < CardValues.length; j++ )
    {
        var Temp =[]
        for( var i=0; i < TotalCard.length; i++ )
        {
            if( CardValues[j] == GDYCardRes.getCardValue(TotalCard[i]) )
            {
                Temp.push(TotalCard[i])
            }
        }
        RltCard[CardValues[j].toString()] = Temp
    }

    for(var i =0; i < TotalCard.length; i++ )
    {
        if( TotalCard[i] == 51 || TotalCard[i] == 53 )
        {
            CardKind.Kings.push(TotalCard[i])
        }
    }

     
    for(var i in RltCard)
    {
        //console.log(i)
        if( RltCard[i].length == 1 )
        {
            CardKind.SingleCards = CardKind.SingleCards.concat(RltCard[i])
        }
        if( RltCard[i].length == 2 )
        {
            CardKind.DoubleCards = CardKind.DoubleCards.concat(RltCard[i])
        }
        if( RltCard[i].length == 3 )
        {
            CardKind.ThreeCards = CardKind.ThreeCards.concat(RltCard[i])
        }
        if( RltCard[i].length == 4 )
        {
            CardKind.FourCards = CardKind.FourCards.concat(RltCard[i])
        }
    }
    return RltCard
}

GameLogic.SearchCardNull =function(TotalCard)
{
    var CloneCard = TotalCard.concat([])
    CardKind.Clean()
    GameLogic.SortCard(CloneCard)
    GameLogic.AnalyzeCard(CloneCard)
    var RltCard = []
    if( TotalCard.length == 1 && TotalCard[0] < 100 )
    {
        var TCard =[]
        TCard.push(TotalCard[0])
        RltCard.push(TCard)
        return RltCard
    }

    
    for( var i=0; i < CardKind.SingleCards.length; i++ )
    {
        var TCard =[]
        TCard.push(CardKind.SingleCards[i])
        RltCard.push(TCard)
    }
    for( var i=0; i < CardKind.DoubleCards.length; i =i+2 )
    {
        var TCard =[]
        TCard.push(CardKind.DoubleCards[i])
        TCard.push(CardKind.DoubleCards[i+1])
        RltCard.push(TCard)
    }

     for( var i=0; i < CardKind.ThreeCards.length; i = i+3 )
     {
        var TCard =[]
        TCard = TCard.concat( CardKind.ThreeCards.slice(i,i+3))
        RltCard.push(TCard)
     }

     for( var i=0; i < CardKind.FourCards.length; i = i+4 )
     {
        var TCard =[]
        TCard = TCard.concat( CardKind.FourCards.slice(i,i+4))
        RltCard.push(TCard)
     }
    if( CardKind.Kings.length == 2)
    {
        var TCard =[]
        TCard = TCard.concat(CardKind.Kings)
        RltCard.push(TCard)
    }
    

    return RltCard
}

GameLogic.SearchCard = function(TotalCard,CardData,CardType)
{
    var CloneCard = TotalCard.concat([])
    CardKind.Clean()
    GameLogic.SortCard(CloneCard)
    GameLogic.AnalyzeCard(CloneCard)

    console.log(CloneCard,CardData)
    switch( CardType)
    {
        case GDYCMD.CardType.CardType_single:   return GameLogic.SearchCard_single(CloneCard,CardData)
        case GDYCMD.CardType.CardType_duizhi:   return GameLogic.SearchCard_duizhi(CloneCard,CardData)
        case GDYCMD.CardType.CardType_shunzi:   return GameLogic.SearchCard_shunzhi(CloneCard,CardData)
        case GDYCMD.CardType.CardType_liandui:   return GameLogic.SearchCard_liandui(CloneCard,CardData)
        case GDYCMD.CardType.CardType_bomb3:   return GameLogic.SearchCard_bomb3(CloneCard,CardData)
        case GDYCMD.CardType.CardType_bomb4:   return GameLogic.SearchCard_bomb4(CloneCard,CardData)
        case GDYCMD.CardType.CardType_bomb5:   return GameLogic.SearchCard_bomb5(CloneCard,CardData)
        case GDYCMD.CardType.CardType_bomb6:   return GameLogic.SearchCard_bomb6(CloneCard,CardData)
        case GDYCMD.CardType.CardType_wangzha:   return GameLogic.SearchCard_wangzha(CloneCard,CardData)
    }
}

GameLogic.IsExistInValue = function(DataArr,CardData)
{
   var Value = GDYCardRes.getCardValue(CardData)
   for( var i=0; i < DataArr.length; i++)
   {
      if( Value == GDYCardRes.getCardValue(DataArr[i]) )
      {
        var Data = DataArr[i]
        return Data
      }
   }
   return null
}

GameLogic.IsExistInValueArr = function(DataArr,CardDataArr)
{
    var Rlt = []
    var NewDataArr = DataArr.concat([])
    for( var i=0; i < CardDataArr.length; i++)
    {
       var Value = GDYCardRes.getCardValue(CardDataArr[i])
       for( var j=0; j < NewDataArr.length; j++)
       {
          if( Value == GDYCardRes.getCardValue(NewDataArr[j]) )
          {
            Rlt.push(NewDataArr[j])
            NewDataArr.splice(j,1)
          }
       }
    }
    return Rlt
}

GameLogic.SearchCardBomb =function(TotalCard,RltCard)
{
    //3张炸弹
    if( CardKind.Kings.length == 2 )
    {
         for( var i=0; i < CardKind.SingleCards.length; i = i+1 )
         {
            var TCard =[]
            TCard = TCard.concat([CardKind.SingleCards[i]])
            TCard = TCard.concat(CardKind.Kings)
            RltCard.push(TCard)
         }
    }

   if( CardKind.Kings.length == 1 )
   {
        //console.log(CardKind.DoubleCards)
        for( var i=0; i < CardKind.DoubleCards.length; i = i+2 )
         {
            var TCard =[]
            TCard = TCard.concat( CardKind.DoubleCards.slice(i,i+2))
            TCard = TCard.concat(CardKind.Kings)
            RltCard.push(TCard)
         }
   }
   
   if( CardKind.Kings.length == 0 )
   {
         for( var i=0; i < CardKind.ThreeCards.length; i = i+3 )
         {
            var TCard =[]
            TCard = TCard.concat( CardKind.ThreeCards.slice(i,i+3))
            TCard = TCard.concat(CardKind.Kings)
            RltCard.push(TCard)
         }
         
   }
   
   //4张炸弹
   if( CardKind.Kings.length == 2 )
   {
         for( var i=0; i < CardKind.DoubleCards.length; i = i+2 )
         {
            var TCard =[]
            TCard = TCard.concat( CardKind.DoubleCards.slice(i,i+2))
            TCard = TCard.concat(CardKind.Kings)
            RltCard.push(TCard)
         }
         
   }
   if( CardKind.Kings.length == 1 )
   {
         for( var i=0; i < CardKind.ThreeCards.length; i = i+3 )
         {
            var TCard =[]
            TCard = TCard.concat( CardKind.ThreeCards.slice(i,i+3))
            TCard = TCard.concat(CardKind.Kings)
            RltCard.push(TCard)
         }
         
   }
   if( CardKind.Kings.length == 0 )
   {
         for( var i=0; i < CardKind.FourCards.length; i = i+4 )
         {
            var TCard =[]
            TCard = TCard.concat( CardKind.FourCards.slice(i,i+4))
            TCard = TCard.concat(CardKind.Kings)
            RltCard.push(TCard)
         }
   }

   //5张炸弹
   if( CardKind.Kings.length == 2 )
   {
         for( var i=0; i < CardKind.ThreeCards.length; i = i+3 )
         {
            var TCard =[]
            TCard = TCard.concat( CardKind.ThreeCards.slice(i,i+3))
            TCard = TCard.concat(CardKind.Kings)
            RltCard.push(TCard)
         }
   }
   if( CardKind.Kings.length == 1 )
   {
         for( var i=0; i < CardKind.FourCards.length; i = i+4 )
         {
            var TCard =[]
            TCard = TCard.concat( CardKind.FourCards.slice(i,i+4))
            TCard = TCard.concat(CardKind.Kings)
            RltCard.push(TCard)
         }
   }

    //6张炸弹
   if( CardKind.Kings.length == 2 )
   {
         for( var i=0; i < CardKind.FourCards.length; i = i+4 )
         {
            var TCard =[]
            TCard = TCard.concat( CardKind.FourCards.slice(i,i+4))
            TCard = TCard.concat(CardKind.Kings)
            RltCard.push(TCard)
         }
   }

   //王炸
   if( CardKind.Kings.length == 2 )
   {
        var TCard =[]
        TCard = TCard.concat(CardKind.Kings)
        RltCard.push(TCard)
   }
   return RltCard
}

GameLogic.SearchCard_single = function(TotalCard,CardData)
{
    //console.log(TotalCard,CardData)
    //console.log(CardData[0])
    //找单张
    var RltCard = []
    var Vaule = GDYCardRes.getCardValue(CardData[0])
    //console.log(Vaule)
    if( Vaule <= 14 )
    {
        var SearchCard = (Vaule == 14) ? [16] :  [16,Vaule+1]
        //console.log(SearchCard)
        //console.log(CardKind.SingleCards)

        for( var j=0; j < TotalCard.length; j++ )
        {
            for( var i=0; i < SearchCard.length; i++ )
            {
                var Vaule = GDYCardRes.getCardValue( TotalCard[j] )
                if( Vaule == SearchCard[i] )
                {
                    var TCard =[]
                    TCard.push( TotalCard[j] )
                    RltCard.push(TCard)
                }
            }
        }
        // for( var i=0; i < CardKind.SingleCards.length; i++ )
        // {
        //     var Vaule = GDYCardRes.getCardValue(CardKind.SingleCards[i])
        //     //console.log(Vaule)
        //     if( Vaule == SearchCard[0] || Vaule == SearchCard[1] )
        //     {
        //         var TCard =[]
        //         TCard.push(CardKind.SingleCards[i])
        //         //console.log("push,",CardKind.SingleCards[i])
        //         RltCard.push(TCard)
        //     }
        // }
    }
    //找炸弹
    GameLogic.SearchCardBomb(TotalCard,RltCard)
    return RltCard
}

GameLogic.SearchCard_duizhi = function(TotalCard,CardData)
{
    //找对子
    var RltCard = []
    var Value = GDYCardRes.getCardValue(CardData[0])

    if( Value <= 14 )
    {
        //常规对
        var SearchCard = (Value == 14) ? [16] :  [16,Value+1]
        for( var i=0; i < CardKind.DoubleCards.length; i =i+2 )
        {
            var Value = GDYCardRes.getCardValue(CardKind.DoubleCards[i])
            if( Value == SearchCard[0] || Value == SearchCard[1] )
            {
                var TCard =[]
                TCard.push(CardKind.DoubleCards[i])
                TCard.push(CardKind.DoubleCards[i+1])
                RltCard.push(TCard)
            }
        }

        //找赖子对
        if( CardKind.Kings.length >= 1 )
        {
            for( var i=0; i < CardKind.SingleCards.length; i =i+1 )
            {
                var Value = GDYCardRes.getCardValue(CardKind.SingleCards[i])
                if( Value == SearchCard[0] || Value == SearchCard[1] )
                {
                    var TCard =[]
                    TCard.push(CardKind.SingleCards[i])
                    TCard.push(CardKind.Kings[0])
                    RltCard.push(TCard)
                }
            }
        }
    }


    //找炸弹
    GameLogic.SearchCardBomb(TotalCard,RltCard)
    return RltCard
}

GameLogic.SearchCard_shunzhi = function(TotalCard,CardData)
{
    var RltCard = []
    var Vaule = GDYCardRes.getCardValue(CardData[0])

    //生成预查找牌
    var SearchCard = []
    for( var i=0; i < CardData.length; i++ )
    {
        var TVaule = Vaule+i+1
        if( TVaule > 14 )
        {
            SearchCard = []
            break
        }
        SearchCard.push(TVaule)
    }
    //console.log(SearchCard)
    //查找牌
    var TCard = []
    var KingIndex = 0
    for( var i=0; i < SearchCard.length; i++ )
    {
        var Data = GameLogic.IsExistInValue(TotalCard,SearchCard[i])
        if( Data == null )
        {
            if( KingIndex < CardKind.Kings.length )
            {//不存在用赖子代替
                TCard.push( CardKind.Kings[KingIndex++])
            }
            else
            {
                //console.log("不存在 ",SearchCard[i])
                TCard=[]
                break
            }
        }
        else
        {
            TCard.push(Data)
        }
    }
    if( TCard.length != 0 )
    {
        RltCard.push(TCard)
    }

    //找炸弹
    GameLogic.SearchCardBomb(TotalCard,RltCard)
    return RltCard
}

GameLogic.SearchCard_liandui = function(TotalCard,CardData)
{
    var RltCard = []
    var Vaule = GDYCardRes.getCardValue(CardData[0])

    console.log(TotalCard,CardData)
    //生成预查找牌
    var SearchCard = []
    for( var i=0; i < CardData.length / 2; i++ )
    {
        var TVaule = Vaule+i+1
        if( TVaule > 14 )
        {
            SearchCard = []
            break
        }
        SearchCard.push(TVaule)
        SearchCard.push(TVaule)
    }
    console.log(SearchCard)
    console.log(CardKind)
    //查找牌
    var TCard = []
    var KingIndex = 0
    for( var i=0; i < SearchCard.length; i = i+2)
    {
        console.log("SearchCard slice = ",SearchCard.slice(i,i+2))
        var Data = GameLogic.IsExistInValueArr(TotalCard,SearchCard.slice(i,i+2))
        console.log(Data)
        TCard = TCard.concat(Data)

        var NeedNum = 2 - Data.length
        var KingNum = CardKind.Kings.length - KingIndex
        //console.log("NeedNum={0} KingNum={1}",NeedNum,KingNum)
        if( NeedNum == 0 )
        {
            continue;
        }
        if( NeedNum > KingNum )
        {//赖子不够
            TCard=[]
            console.log("赖子不够 ",NeedNum,KingNum,KingIndex)
            break
        }
        else
        {
            TCard.push( CardKind.Kings[KingIndex++])
        }
    }
    if( TCard.length != 0 )
    {
        RltCard.push(TCard)
    }
    //console.log("搜索连双结果",RltCard)
    //找炸弹
    GameLogic.SearchCardBomb(TotalCard,RltCard)
    return RltCard
}

GameLogic.SearchCard_bomb3 = function(TotalCard,CardData)
{
    var RltCard = []
    var RltCard2 = []
    GameLogic.SearchCardBomb(TotalCard,RltCard)
    console.log("所有炸弹",RltCard)
    for(var i=0; i < RltCard.length;i++)
    {
        //console.log( RltCard[i],CardData )
        if( true == GameLogic.CompareCard(RltCard[i],CardData ) )
        {
            RltCard2.push(RltCard[i])
        }
    }
    return RltCard2
}

GameLogic.SearchCard_bomb4 = function(TotalCard,CardData)
{
    return GameLogic.SearchCard_bomb3(TotalCard,CardData)
}

GameLogic.SearchCard_bomb5 = function(TotalCard,CardData)
{
    return GameLogic.SearchCard_bomb3(TotalCard,CardData)
}

GameLogic.SearchCard_bomb6 = function(TotalCard,CardData)
{
    return GameLogic.SearchCard_bomb3(TotalCard,CardData)
}

GameLogic.SearchCard_wangzha = function(TotalCard,CardData)
{
    var RltCard = []
    return RltCard
}

GameLogic.CompareCard = function(CardArr1,CardArr2,showCard)
{
    var CardTypeRlt1 = GameLogic.getCardType(CardArr1)
    var CardTypeRlt2 = GameLogic.getCardType(CardArr2)
    console.log(CardTypeRlt1,CardTypeRlt2)
    if( CardTypeRlt1.Rlt == GDYCMD.CardType.CardType_Null || CardTypeRlt2.Rlt == GDYCMD.CardType.CardType_Null )
    {
        return false
    }
    if( CardTypeRlt1.Rlt == GDYCMD.CardType.CardType_wangzha )
    {
        return true;
    }

    if( CardTypeRlt1.Rlt == CardTypeRlt2.Rlt )
    {
        switch(CardTypeRlt2.Rlt)
        {
            case GDYCMD.CardType.CardType_single:   return GameLogic.CompareCard_single(CardTypeRlt1.show,CardTypeRlt2.show)
            case GDYCMD.CardType.CardType_duizhi:   return GameLogic.CompareCard_duizhi(CardTypeRlt1.show,CardTypeRlt2.show)
            case GDYCMD.CardType.CardType_shunzi:   return GameLogic.CompareCard_shunzi(CardArr1,CardTypeRlt2.show,showCard)
            case GDYCMD.CardType.CardType_liandui:   return GameLogic.CompareCard_liandui(CardTypeRlt1.show,CardTypeRlt2.show)
            case GDYCMD.CardType.CardType_bomb3:   return GameLogic.CompareCard_bomb3(CardTypeRlt1.show,CardTypeRlt2.show)
            case GDYCMD.CardType.CardType_bomb4:   return GameLogic.CompareCard_bomb4(CardTypeRlt1.show,CardTypeRlt2.show)
            case GDYCMD.CardType.CardType_bomb5:   return GameLogic.CompareCard_bomb5(CardTypeRlt1.show,CardTypeRlt2.show)
            default: break;
        }
    }
    else
    {
        if( CardTypeRlt1.Rlt >= GDYCMD.CardType.CardType_bomb3 )
        {
            if( CardTypeRlt2.Rlt >= GDYCMD.CardType.CardType_bomb3 )
            {
                return CardTypeRlt1.Rlt > CardTypeRlt2.Rlt
            }
            return true
        }
    }
    return false
}

GameLogic.CompareCard_single =function(CardArr1,CardArr2)
{
    var Value1 = GDYCardRes.getCardValue(CardArr1[0])
    var Value2 = GDYCardRes.getCardValue(CardArr2[0])

    if( Value1 == 16 && Value2 != 16 )
    {
        return true
    }
    return (Value1-1) == Value2 ? true : false
}

GameLogic.CompareCard_duizhi =function(CardArr1,CardArr2)
{
    return GameLogic.CompareCard_single(CardArr1,CardArr2)
}

GameLogic.CompareCard_shunzi =function(CardArr1,CardArr2,showCard)
{
    // if( CardArr1.length != CardArr2.length )
    // {
    //     return false
    // }
    // return GameLogic.CompareCard_single(CardArr1,CardArr2)
    console.log(CardArr1)
    if( CardArr1.length != CardArr2.length )
    {
        return false
    }
    // var GetMinCard = function(CardArr)
    // {

    // }

    //var MinCard1 = GetMinCard(CardArr1)
    //var MinCard2 = GetMinCard(CardArr2)

    var Rlt = GameLogic.SplatKing(CardArr1)
    console.log(Rlt)
    if( Rlt.King.length == 0 )
    {
        return GameLogic.CompareCard_single(CardArr1,CardArr2)
    }
    if( Rlt.King.length == 1 )
    {
        for( var i=14; i >=3 ; i--)
        {
            var TArr = []
            TArr = TArr.concat(Rlt.Nor)
            TArr[TArr.length] = 500+i
            
            if( true == GameLogic._isshunzi_nor(TArr) && true == GameLogic.CompareCard_single(TArr,CardArr2) )
            {
                console.log("TArr=",TArr)
                var CloneRlt = TArr.concat([])
                GameLogic.CopyIn(TArr,showCard)
                console.log("showCard=",showCard)
                GameLogic._restoreCard(TArr,Rlt.King)
                GameLogic.CopyIn(TArr,CardArr1)
                return true
            }
        }
        for( var i=14; i >=3 ; i--)
        {
            var TArr = []
            TArr = TArr.concat(Rlt.Nor)
            TArr[0] = 500+i
            TArr = TArr.concat(Rlt.Nor)
            if( true == GameLogic._isshunzi_nor(TArr) && true == GameLogic.CompareCard_single(TArr,CardArr2) )
            {

                var CloneRlt = TArr.concat([])
                GameLogic.CopyIn(TArr,showCard)
                console.log("TArr=",TArr)
                console.log("showCard=",showCard)
                GameLogic._restoreCard(TArr,Rlt.King)
                GameLogic.CopyIn(TArr,CardArr1)
                return true
            }
        }
    }
    return false
}

GameLogic.CompareCard_liandui =function(CardArr1,CardArr2)
{
    if( CardArr1.length != CardArr2.length )
    {
        return false
    }
    return GameLogic.CompareCard_single(CardArr1,CardArr2)
}

GameLogic.CompareCard_bomb3 =function(CardArr1,CardArr2)
{
    var Value1 = GDYCardRes.getCardValue(CardArr1[0])
    var Value2 = GDYCardRes.getCardValue(CardArr2[0])
    return Value1 > Value2 ? true : false
}

GameLogic.CompareCard_bomb4 =function(CardArr1,CardArr2)
{
    var Value1 = GDYCardRes.getCardValue(CardArr1[0])
    var Value2 = GDYCardRes.getCardValue(CardArr2[0])
    return Value1 > Value2 ? true : false
}

GameLogic.CompareCard_bomb5 =function(CardArr1,CardArr2)
{
    var Value1 = GDYCardRes.getCardValue(CardArr1[0])
    var Value2 = GDYCardRes.getCardValue(CardArr2[0])
    return Value1 > Value2 ? true : false
}

GameLogic.getCardType = function(CardData)
{
    var Rlt = {Rlt:GDYCMD.CardType.CardType_Null,show:[]}
    Rlt = GameLogic.getCardType_wangzha(CardData)
    if( GDYCMD.CardType.CardType_Null != Rlt.Rlt )
    {
        return Rlt
    }

    Rlt = GameLogic.getCardType_bomb6(CardData)
    if( GDYCMD.CardType.CardType_Null != Rlt.Rlt )
    {
       return Rlt
    }

    Rlt = GameLogic.getCardType_bomb5(CardData)
    if( GDYCMD.CardType.CardType_Null != Rlt.Rlt )
    {
        return Rlt
    }

    Rlt = GameLogic.getCardType_bomb4(CardData)
    if( GDYCMD.CardType.CardType_Null != Rlt.Rlt )
    {
        return Rlt
    }

    Rlt = GameLogic.getCardType_bomb3(CardData)
    if( GDYCMD.CardType.CardType_Null != Rlt.Rlt )
    {
        return Rlt
    }

    Rlt = GameLogic.getCardType_liandui(CardData)
    if( GDYCMD.CardType.CardType_Null != Rlt.Rlt )
    {
        return Rlt
    }

    Rlt = GameLogic.getCardType_shunzi(CardData)
    if( GDYCMD.CardType.CardType_Null != Rlt.Rlt )
    {
        return Rlt
    }

    Rlt = GameLogic.getCardType_duizhi(CardData)
    if( GDYCMD.CardType.CardType_Null != Rlt.Rlt )
    {
        return Rlt
    }

    Rlt = GameLogic.getCardType_single(CardData)
    if( GDYCMD.CardType.CardType_Null != Rlt.Rlt )
    {
        return Rlt
    }
    return Rlt
   
}

GameLogic.getCardType_single = function(CardData)
{
    //if( CardData.length == 1 && CardData[0] != 51 && CardData[0] != 53 )
    if( CardData.length == 1 )
    {
        return {Rlt:GDYCMD.CardType.CardType_single,show:CardData}
    }
   return {Rlt:GDYCMD.CardType.CardType_Null,show:[]}
}

GameLogic.getCardType_shunzi = function(CardData)
{
    if( CardData.length < 3 ) 
    {
        return {Rlt:GDYCMD.CardType.CardType_Null,show:[]}
    }
    if( true == GameLogic.IsInclude2(CardData) )
    {
        return {Rlt:GDYCMD.CardType.CardType_Null,show:[]}
    }
    var Rlt = GameLogic.SplatKing(CardData)

    if( Rlt.King.length == 0 )
    {
        if( true == GameLogic._isshunzi_nor(Rlt.Nor) )
        {
            GameLogic.CopyIn(Rlt.Nor,CardData)
            return {Rlt:GDYCMD.CardType.CardType_shunzi,show:CardData}
        }
       return {Rlt:GDYCMD.CardType.CardType_Null,show:[]}
    }

    if( Rlt.King.length == 1 )
    {
        for( var i=14; i >=3 ; i--)
        {
            var TArr = []
            TArr = TArr.concat(Rlt.Nor)
            TArr[TArr.length] = 500+i
            if( true == GameLogic._isshunzi_nor(TArr) )
            {
                var CloneRlt = TArr.concat([])
                GameLogic._restoreCard(TArr,Rlt.King)
                GameLogic.CopyIn(TArr,CardData)
                return {Rlt:GDYCMD.CardType.CardType_shunzi,show:CloneRlt}
            }
        }
    }

    if( Rlt.King.length == 2 )
    {
        for( var i=14; i >=3 ; i--)
        {
            for( var j=14; j >= 3; j--)
            {
                var TArr = []
                TArr = TArr.concat(Rlt.Nor)
                TArr[TArr.length] = 500+i
                TArr[TArr.length] = 500+j
                //console.log(TArr)
                if( true == GameLogic._isshunzi_nor(TArr) )
                {
                    var CloneRlt = TArr.concat([])
                    GameLogic._restoreCard(TArr,Rlt.King)
                    GameLogic.CopyIn(TArr,CardData)
                    return {Rlt:GDYCMD.CardType.CardType_shunzi,show:CloneRlt}
                }
            }
        }
    }
    return {Rlt:GDYCMD.CardType.CardType_Null,show:[]}
}

GameLogic.getCardType_duizhi = function(CardData)
{
    if( CardData.length != 2 )
    {
        return {Rlt:GDYCMD.CardType.CardType_Null,show:[]}
    }
    var Rlt = GameLogic.SplatKing(CardData)
    if( Rlt.King.length == 1 )
    {
        return {Rlt:GDYCMD.CardType.CardType_duizhi,show:[Rlt.Nor[0],Rlt.Nor[0]]}
    }
    if( Rlt.King.length == 0 )
    {
        if( GDYCardRes.getCardValue(Rlt.Nor[0]) == GDYCardRes.getCardValue(Rlt.Nor[1]) )
        {
            return {Rlt:GDYCMD.CardType.CardType_duizhi,show:CardData}
        }
    }
    return {Rlt:GDYCMD.CardType.CardType_Null,show:[]}
}

GameLogic.getCardType_liandui = function(CardData)
{
    if( CardData.length < 4 || CardData.length % 2 != 0)
    {
        return {Rlt:GDYCMD.CardType.CardType_Null,show:[]}
    }

    if( true == GameLogic.IsInclude2(CardData) )
    {
        return {Rlt:GDYCMD.CardType.CardType_Null,show:[]}
    }

    var Rlt = GameLogic.SplatKing(CardData)
    if( Rlt.King.length == 0 )
    {
        if( true == GameLogic._isliandui_nor(Rlt.Nor) )
        {
            GameLogic.CopyIn(Rlt.Nor,CardData)
            return {Rlt:GDYCMD.CardType.CardType_liandui,show:CardData}
        }
        return {Rlt:GDYCMD.CardType.CardType_Null,show:[]}
    }
    if( Rlt.King.length == 1 )
    {
        for( var i=14; i >=3 ; i--)
        {
            var TArr = []
            TArr = TArr.concat(Rlt.Nor)
            TArr[TArr.length] = 500+i
            if( true == GameLogic._isliandui_nor(TArr) )
            {
                var CloneRlt = TArr.concat([])
                GameLogic._restoreCard(TArr,Rlt.King)
                GameLogic.CopyIn(TArr,CardData)
                return {Rlt:GDYCMD.CardType.CardType_liandui,show:CloneRlt}
            }
        }
    }

    if( Rlt.King.length == 2 )
    {
        for( var i=14; i >=3 ; i--)
        {
            for( var j=14; j >= 3; j--)
            {
                var TArr = []
                TArr = TArr.concat(Rlt.Nor)
                TArr[TArr.length] = 500+i
                TArr[TArr.length] = 500+j
                if( true == GameLogic._isliandui_nor(TArr) )
                {
                    var CloneRlt = TArr.concat([])
                    GameLogic._restoreCard(TArr,Rlt.King)
                    GameLogic.CopyIn(TArr,CardData)
                    return {Rlt:GDYCMD.CardType.CardType_liandui,show:CloneRlt}
                }
            }
        }
    }
     return {Rlt:GDYCMD.CardType.CardType_Null,show:[]}
}

GameLogic.getCardType_bomb3 = function(CardData)
{
    if( CardData.length != 3 )
    {
        return {Rlt:GDYCMD.CardType.CardType_Null,show:[]}
    }

    var Rlt = GameLogic.SplatKing(CardData)
    //console.log(Rlt)
    if( true == GameLogic.IsSameValue(Rlt.Nor)  )
    {
        var CloneRlt = Rlt.Nor.concat([])
        Rlt.Nor = Rlt.Nor.concat(Rlt.King)
        GameLogic.CopyIn(Rlt.Nor,CardData)

        var Value = GDYCardRes.getCardValue(Rlt.Nor[0])
        for( var i=0; i < Rlt.King.length; i++ )
        {
            CloneRlt.push(500 + Value)
        }
        //console.log(CloneRlt)
        return {Rlt:GDYCMD.CardType.CardType_bomb3,show:CloneRlt}
    }
    return {Rlt:GDYCMD.CardType.CardType_Null,show:[]}
}

GameLogic.getCardType_bomb4 = function(CardData)
{
    if( CardData.length != 4 )
    {
        return {Rlt:GDYCMD.CardType.CardType_Null,show:[]}
    }

    var Rlt = GameLogic.SplatKing(CardData)
    if( true == GameLogic.IsSameValue(Rlt.Nor)  )
    {
        var CloneRlt = Rlt.Nor.concat([])
        Rlt.Nor = Rlt.Nor.concat(Rlt.King)
        GameLogic.CopyIn(Rlt.Nor,CardData)

        var Value = GDYCardRes.getCardValue(Rlt.Nor[0])
        for( var i=0; i < Rlt.King.length; i++ )
        {
            CloneRlt.push(500 + Value)
        }

        return {Rlt:GDYCMD.CardType.CardType_bomb4,show:CloneRlt}
    }
    return {Rlt:GDYCMD.CardType.CardType_Null,show:[]}
}

GameLogic.getCardType_bomb5 = function(CardData)
{
    if( CardData.length != 5 )
    {
        return {Rlt:GDYCMD.CardType.CardType_Null,show:[]}
    }

    var Rlt = GameLogic.SplatKing(CardData)
    if( true == GameLogic.IsSameValue(Rlt.Nor)  )
    {
        var CloneRlt = Rlt.Nor.concat([])
        Rlt.Nor = Rlt.Nor.concat(Rlt.King)
        GameLogic.CopyIn(Rlt.Nor,CardData)

        var Value = GDYCardRes.getCardValue(Rlt.Nor[0])
        for( var i=0; i < Rlt.King.length; i++ )
        {
            CloneRlt.push(500 + Value)
        }

        return {Rlt:GDYCMD.CardType.CardType_bomb5,show:CloneRlt}
    }
    return {Rlt:GDYCMD.CardType.CardType_Null,show:[]}
}

GameLogic.getCardType_bomb6 = function(CardData)
{
    if( CardData.length != 6 )
    {
        return {Rlt:GDYCMD.CardType.CardType_Null,show:[]}
    }

    var Rlt = GameLogic.SplatKing(CardData)
    if( true == GameLogic.IsSameValue(Rlt.Nor)  )
    {
         var CloneRlt = Rlt.Nor.concat([])
        Rlt.Nor = Rlt.Nor.concat(Rlt.King)
        GameLogic.CopyIn(Rlt.Nor,CardData)

        var Value = GDYCardRes.getCardValue(Rlt.Nor[0])
        for( var i=0; i < Rlt.King.length; i++ )
        {
            CloneRlt.push(500 + Value)
        }

        return {Rlt:GDYCMD.CardType.CardType_bomb6,show:CloneRlt}
    }
    return {Rlt:GDYCMD.CardType.CardType_Null,show:[]}
}

GameLogic.getCardType_wangzha = function(CardData)
{
    if( CardData.length != 2 )
    {
        return {Rlt:GDYCMD.CardType.CardType_Null,show:[]}
    }
    var Rlt = GameLogic.SplatKing(CardData)

    if( Rlt.King.length == 2 )
    {
        return {Rlt:GDYCMD.CardType.CardType_wangzha,show:CardData}
    }

    return {Rlt:GDYCMD.CardType.CardType_Null,show:[]}
}


GameLogic._isliandui_nor = function(CardData)
{
    GameLogic.SortCard(CardData)
    //console.log("排序",CardData)
    var CurValue = 0
    for( var i=0; i < CardData.length ; i++ )
    {
        var Value1 = GDYCardRes.getCardValue(CardData[i])
        var Value2 = GDYCardRes.getCardValue(CardData[i+1])
        if( Value1 != Value2 )
        {
            return false
        }

        if( i == 0 )
        {
           CurValue = Value1
        }
        else
        {
            if( ( CurValue +1) != Value1 )
            {
                return false;
            }
            CurValue = CurValue + 1
        }
        i = i+1
    }
    return true;
}

GameLogic._isshunzi_nor = function(CardData)
{
    GameLogic.SortCard(CardData)
    var BeginValue = GDYCardRes.getCardValue(CardData[0])
    for(var i=1; i < CardData.length; i++ )
    {
        BeginValue = BeginValue + 1
        if( BeginValue != GDYCardRes.getCardValue( CardData[i] ))
        {
            return false;
        }
    }
    return true
}

GameLogic._restoreCard = function(CardData,restorecard)
{
    var index = 0
    for(var i=0; i < CardData.length; i++)
    {
        if( GDYCardRes.getCardColor(CardData[i] ) == 5 )
        {
            CardData[i] = restorecard[index]
            index++
        }
    }
}

GameLogic._switchKingCard = function(KingArr,switchdata)
{
    var Rlt = []
    for(var i=0; i < King.length; i++ )
    {
        Rlt.push( 500+switchdata)
    }
    return Rlt
}

GameLogic.SortCard = function(CardData)
{
    //console.log(CardData)
    for( var i = 0 ; i < CardData.length-1; i++ )
    {
        for( var j=i+1; j < CardData.length; j++ )
        {
            var Value1 = GDYCardRes.getCardValue(CardData[i])
            var Value2 = GDYCardRes.getCardValue(CardData[j])
            //console.log(CardData[i],CardData[j],i,j,Value1,Value2)
            if( Value1 > Value2 )
            {
                var T = CardData[i]
                CardData[i] = CardData[j]
                CardData[j] = T
            }
        }
    }
}

GameLogic.SortCardByLogivValue = function(CardData)
{
    GameLogic.SortCard(CardData)
    CardData.reverse()
}

GameLogic.SplatKing =function(CardData)
{
    var Rlt = {King:[],Nor:[]}
    for(var i=0;i < CardData.length; i++ )
    {
        var Value = GDYCardRes.getCardValue(CardData[i])
        if( Value == 51 || Value == 53 )
        {
            Rlt.King.push(CardData[i])
        }
        else
        {
            Rlt.Nor.push(CardData[i])
        }
    }
    return Rlt
}

GameLogic.IsInclude2 = function(CardData)
{
    for(var i=0;i < CardData.length; i++ )
    {
         var Value = GDYCardRes.getCardValue(CardData[i])
         if( Value == 16 )
         {
            return true;
         }
    }
    return false;
}

GameLogic.IsSameValue = function(CardData)
{
    var FirstValue = 0
    for(var i=0; i < CardData.length; i++ )
    {
         var Value = GDYCardRes.getCardValue(CardData[i])
         if( i == 0 )
         {
            FirstValue = Value
         }
         else if( Value != FirstValue)
         {
            return false
         }
    }
    return true;
}

GameLogic.CopyIn = function(DataSrc,DataDst)
{
    for( var i=0; i < DataSrc.length; i++ )
    {
        DataDst[i] = DataSrc[i]
    }
}




module.exports = GameLogic