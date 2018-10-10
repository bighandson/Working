/**
 *  时间管理
 */

cc.Class({
    extends:cc.Component,
    properties:{
        atlas:cc.SpriteAtlas,
        time0:cc.Node,
        time1:cc.Node,
        lights:{
            default:[],
            type:cc.Node
        },
        darks:{
            default:[],
            type:cc.Node
        },
        threedarks:{
            default:[],
            type:cc.Node
        },
        threelights:{
            default:[],
            type:cc.Node
        },
        twodarks:{
            default:[],
            type:cc.Node
        },
        twolights:{
            default:[],
            type:cc.Node
        }
    },

   onLoad:function(){
     this.time = 0;
     this.dir = 0;
     this.time0.active = false;
     this.time1.active = false;
   },

   initUI:function(masterId,renshu){
      this.renshu = renshu;
      masterId = Number(masterId);
      this.unschedule(this._timeDown);
      this.time0.active = true;
      this.time1.active = true;
      let dir = ['down','right','up','left'];
      let feng = ['east','south','west','north'];
      if (renshu == 3){
          dir = ['down','right','left'];
          feng = ['east','south','west'];
          this.darks[2].active = false;
          this.lights[2].active = false;
          for(let i in this.threedarks){
              let _dir =(Number(i)+3-(masterId==3?2:masterId))%3;

              cc.log('masterid',masterId,_dir);
              let name = dir[i]+'_dark_'+feng[_dir];
            //   name = name==='left_dark_east'?'left_dark_esat':name;
              console.log('i=',i,name);
              this.threedarks[i].getComponent(cc.Sprite).spriteFrame = this.atlas.getSpriteFrame(name);
              this.threelights[i].active = true;
              this.threelights[i].getComponent(cc.Sprite).spriteFrame = this.atlas.getSpriteFrame(dir[i]+'_light_'+feng[_dir]);
          }
      } else  if (renshu == 2){
          dir = ['down','up'];
          feng = ['east','west'];
          this.darks[1].active = false;
          this.lights[1].active = false;
          this.darks[3].active = false;
          this.lights[3].active = false;
          for(let i in this.twodarks){
              let _dir = (Number(i)+2-(masterId==2?1:masterId))%2;
              cc.log('masterid',masterId,_dir);

              let name = dir[i]+'_dark_'+feng[_dir];
            //   name = name==='left_dark_east'?'left_dark_esat':name;
              console.log('i=',i,name);
              this.twodarks[i].getComponent(cc.Sprite).spriteFrame = this.atlas.getSpriteFrame(name);
              this.twolights[i].active = true;
              this.twolights[i].getComponent(cc.Sprite).spriteFrame = this.atlas.getSpriteFrame(dir[i]+'_light_'+feng[_dir]);
          }
      }else {
          for (let i in this.darks) {
              let name = dir[i] + '_dark_' + feng[(Number(i) + 4 - masterId) % 4];
            //   name = name === 'left_dark_east' ? 'left_dark_esat' : name;
              console.log('i=', i, name);
              this.darks[i].getComponent(cc.Sprite).spriteFrame = this.atlas.getSpriteFrame(name);
              this.lights[i].active = true;
              this.lights[i].getComponent(cc.Sprite).spriteFrame = this.atlas.getSpriteFrame(dir[i] + '_light_' + feng[(Number(i) + 4 - masterId) % 4]);
          }
      }
   },


   active:function(dir,time){
     console.log('active',dir,time);
     dir = Number(dir);
     let checkArr = [0,1,2,3];
     let len = checkArr.filter(function(e){
       return dir === e;
     }).length;
     if(len>0){
       time = time||15;
       this.timeDown(time);
       this.flash(dir);
     }
   },
    stay:function () {
        this.unschedule(this._timeDown);
    },

   timeDown:function(time){
     this.time = time||15;
     this.schedule(this._timeDown,1);
   },
    sendRule:function (rule) {
          this.rule = rule
    },
   _timeDown:function(){
     let ten = Math.floor(this.time/10);
     let unit = this.time%10;
     this.time0.getComponent(cc.Sprite).spriteFrame = this.atlas.getSpriteFrame(''+ten);
     this.time1.getComponent(cc.Sprite).spriteFrame = this.atlas.getSpriteFrame(''+unit);
     this.time0.active = true;
     this.time1.active = true;
     this.time -- ;

       if(this.time == 3 && this.dir == 0 ){
           // 超时提示
       }

     if(this.time<0){
       this.unschedule(this._timeDown);
         if(this.dir == 0){
             this.rule.overTime();

             cc.log('超时~~~~~');
         }
     }
   },

   flash:function(dir){
      this.dir = dir;
      cc.log('dir',dir);
      if (this.renshu == 2){
          if (dir == 2) dir =1;
          for(let i in this.twolights){
              if(i==dir){
                  this.twolights[i].active = true;
                  this.twolights[i].getComponent(cc.Animation).play('flash');
              }else{
                  this.twolights[i].getComponent(cc.Animation).stop();
                  this.twolights[i].active = false;
              }
          }
      }else if (this.renshu == 3){
          if (dir == 3) dir =2;
          for(let i in this.threelights){
              if(i==dir){
                  this.threelights[i].active = true;
                  this.threelights[i].getComponent(cc.Animation).play('flash');
              }else{
                  this.threelights[i].getComponent(cc.Animation).stop();
                  this.threelights[i].active = false;
              }
          }
      }else {
          for(let i in this.lights){
              if(i==dir){
                  this.lights[i].active = true;
                  this.lights[i].getComponent(cc.Animation).play('flash');
              }else{
                  this.lights[i].getComponent(cc.Animation).stop();
                  this.lights[i].active = false;
              }
          }
      }

   },
     
     stopActive : function () {
         this.unschedule(this._timeDown);
         for(let i = 0; i < this.lights.length; i++){
             let light = this.lights[i];
             light.getComponent(cc.Animation).stop();
         }
     },
     
 });
