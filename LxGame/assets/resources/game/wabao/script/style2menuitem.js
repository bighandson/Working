import { format } from 'url';
import { totalmem } from 'os';

/**
 * Created by ximena on 2017/5/26.
 */
var config = require('Config');
// var controller = require('style2TopController');
cc.Class({
    extends: cc.Component,

    properties: {
        
        //往期开奖
        username: cc.Node,//昵称
        header: cc.Node,//头像
        qishu:cc.Label, //期数
        jiangli:cc.Label,//奖励
        zhaomu:cc.Label,//招募

        //当前寻宝
        period:cc.Label,//寻宝期数
        picture:cc.Node,//奖励财富类型图片
        xbaward:cc.Label,//奖励数字
        totalnum:cc.Label,//总共需要人数
        need:cc.Label,//还需要人数
        mynum:cc.Label,//当前人数
        probability:cc.Label,//概率
        progress:cc.ProgressBar,//进度条
        message:cc.Label,
        hjmessage:cc.Label,//获奖用户信息

/****xxxx***aaaa****bbbb*****cccc****dddd****/
    },
    onLoad: function () {
        // GlobEvent.on('updateXunbao',this.updateXunbao.bind(this));
        // GlobEvent.on("updataBeans",this.updataBeans,this);
    },



    //挖宝数据初始化UI
    //往期开奖UI
    initWanqiUI:function(rank,data){
        let qishu = formatNum(data.lsh);
        let sex = data.xb;
        let tx = data.tx;
        let jl = data.jlje;//奖励
        let lx = data.jlzhlx;
        let zm = data.zsl;//招募
        let name = formatName(data.nc);//玩家名字
        if(!isUrl(tx)){
            let sexs = sex == 1 ? "man":"woman";
            tx = 'commonRes/other/'+sexs;
            // self.header.getComponent(cc.Sprite).spriteFrame = tx;
        }
        let self = this;
        getSpriteFrameByUrl(tx,function(err , spriteFrame){
            if(err){
                cc.log("err",err);
                return;
            }
            self.header.getComponent(cc.Sprite).spriteFrame = spriteFrame;
        });
        this.qishu.getComponent(cc.Label).string = qishu +"期获奖用户";
        this.username.getComponent(cc.Label).string = "玩家:"+name;
        this.jiangli.getComponent(cc.Label).string ="奖励:"+formatNum(jl)+(lx==3?'金币':'钻石');
        this.zhaomu.getComponent(cc.Label).string  = "招募矿工:"+zm;

    },

    //当前寻宝UI
    initXunbaoUI:function(data){
        cc.log("data",data);
        
        let period = data.name;
        let picture = data.jlpic;
        // let xbaward = data.jlms;
        let totalnum = data.zsl;
        let need = data.sysl;
        let mynum = data.gmsl;
        let probability = data.zjjl;
        let jl = data.jlje;//奖励
        let lx = data.jlzhlx;

        this.period.getComponent(cc.Label).string = period;
        let self = this;
        getSpriteFrameByUrl('game/'+picture,function(err,spriteFrame){
            if(err){
                cc.log("加载奖励类型财富图片失败!!!",err);
            }
            self.picture.getComponent(cc.Sprite).spriteFrame = spriteFrame;
            cc.find('Canvas/background/caifu').getComponent(cc.Sprite).spriteFrame = spriteFrame;
        });
        this.xbaward.string = formatNum(jl)+(lx==3?'金币':'钻石');;
        this.totalnum.string = "总共需要"+totalnum+"矿工";
        this.need.string = "还需要"+need+"名";
        this.mynum.string = "我的矿工:"+mynum;
        this.probability.string = "我的得宝几率:"+probability;
        this.progress.progress = (totalnum-need)/totalnum;
        
    },
    // //当前暂无寻宝UI
    // init_noXunbaoUI:function(data){
    //     //TODO:
    //     let message = data.message;
    //     this.message.string = message;

    // },

  
});

