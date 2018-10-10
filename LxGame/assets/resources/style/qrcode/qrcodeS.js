cc.Class({
    extends: cc.Component,

    properties: {
       duihuan:cc.SpriteFrame
    },

    // use this for initialization
    onLoad: function () {
        var self = this
        this.node.on(cc.Node.EventType.TOUCH_START, function () {
            self.node.removeFromParent(true)
        });
    },

    initQrcode : function (param,isDuihuan) {
        if(isDuihuan){
	        this.node.getChildByName('box').getComponent(cc.Sprite).spriteFrame  = this.duihuan;
        }
        this.node.getChildByName('box').getChildByName('name').getComponent(cc.Label).string = param.name

        var qrcode = new QRCode(-1, QRErrorCorrectLevel.H);
        qrcode.addData(param.url);
        qrcode.make();

        var node = this.node.getChildByName('box').getChildByName('qrcode')

        var ctx = node.getComponent(cc.Graphics);

        // compute tileW/tileH based on node width and height
        var tileW = node.width / qrcode.getModuleCount();
        var tileH = node.height / qrcode.getModuleCount();

        // draw in the Graphics
        for (var row = 0; row < qrcode.getModuleCount(); row++) {
            for (var col = 0; col < qrcode.getModuleCount(); col++) {
                // ctx.fillStyle = qrcode.isDark(row, col) ? options.foreground : options.background;
                if (qrcode.isDark(row, col)) {
                    ctx.fillColor = cc.Color.BLACK;
                } else {
                    ctx.fillColor = cc.Color.WHITE;
                }
                var w = (Math.ceil((col + 1) * tileW) - Math.floor(col * tileW));
                var h = (Math.ceil((row + 1) * tileW) - Math.floor(row * tileW));
                ctx.rect(Math.round(col * tileW), Math.round(row * tileH), w, h);
                ctx.fill();
            }
        }
    }
});
