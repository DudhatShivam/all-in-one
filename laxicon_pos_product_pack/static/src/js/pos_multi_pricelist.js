odoo.define('pos_multi_pricelist.pos_multi_pricelist', function (require) {
"use strict";
var models = require('point_of_sale.models');
var screens = require('point_of_sale.screens');
var PosBaseWidget = require('point_of_sale.BaseWidget');
var gui = require('point_of_sale.gui');
var core = require('web.core');
var utils = require('web.utils');
var Mutex = utils.Mutex;
var round_di = utils.round_decimals;
var round_pr = utils.round_precision;
var Model = require('web.DataModel');
var QWeb = core.qweb;
var _t = core._t;

models.load_fields('pos.config','min_sequence');
models.load_fields('pos.config','pricelist_ids');

    models.load_loaded = function() {
        var models1 = models.PosModel.prototype.models;
        for (var i = 0; i < models1.length; i++) {
            var model = models1[i];        
            if (model.model === "product.product") {
                models1[i] = {
                    model:  'product.product',
                    fields: ['display_name', 'list_price', 'price', 'pos_categ_id', 'taxes_id', 'barcode', 'default_code', 'to_weight', 'uom_id', 'description_sale', 'description', 'product_tmpl_id'],
                    order:  ['sequence','name'],
                    domain: [['sale_ok','=',true],['available_in_pos','=',true]],
                    context: function(self){ 
                        return { pricelist: self.config.wk_pricelist, display_default_code: false }; 
                    },
                    loaded: function(self, products){
                        self.db.add_products(products);
                        var product_ids = new Array();
                        for (var product in self.db.product_by_id){
                            product_ids.push(parseInt(product));
                        }
                        (new Model('pos.config')).call('get_product_price_information',[{'pos_config_id':self.config.id, 'product_ids':product_ids,'min_sequence':parseInt(self.config.min_sequence)}])  
                            .then(function (result) { 
                                self.set({'wk_product_prices' : result});
                            });
                    },
                };
            }
        }
    };
    models.load_loaded();


    PosBaseWidget.include({
        get_new_product_price: function(product_id){
            self = this;
            var product_price = false;
            var price_data = self.pos.get('wk_product_prices');
            for (var pricelist in price_data){
                if (product_id in price_data[pricelist]){
                    if (price_data[pricelist][product_id]['type']=='sequence'){
                        return price_data[pricelist][product_id];
                    }
                }
            }
            return false;
        },
        get_product_volume_info: function(product_id){
            self = this;
            var price_data = self.pos.get('wk_product_prices');
            for (var pricelist in price_data){
                if (product_id in price_data[pricelist]){
                    if (price_data[pricelist][product_id]['type']=='volume'){
                        return price_data[pricelist][product_id];
                    }
                }
            }
            return false;
        },
    });

    var ProductScreenWidget = screens.ProductScreenWidget.include({ 
        click_product: function(product) {
            self = this;
            var check = self.volume_product(product.id);
            if (!check){
                if(product.to_weight && this.pos.config.iface_electronic_scale){
                    this.gui.show_screen('scale',{product: product});
                }else{
                   this.pos.get_order().add_product(product);
                }
            }else{
                this.gui.show_screen('selectProduct',{wk_product_prices: check});
            }            
        },

        volume_product: function(product_id){
            self = this;
            var check = false;
            var product_price_options = new Array();
            var price_data = self.pos.get('wk_product_prices');

            for (var pricelist in price_data){
                if (product_id in price_data[pricelist]){
                    if (price_data[pricelist][product_id]['type']=='volume'){
                        check = true;
                    }
                    product_price_options.push(price_data[pricelist][product_id]);
                }
            }
            if (product_price_options.length>0){
                if (check){
                    return product_price_options;
                }                
            }
            return false;
        }
    });

    var SelectProductScreenWidget = screens.ScreenWidget.extend({
        template: 'SelectProductScreenWidget',
        show_leftpane: true,
        back_screen: 'products',

        renderElement: function(){
            self = this;
            this._super();
            var product_data = this.gui.get_current_screen_param('wk_product_prices');
            if(!product_data){
                return;
            }
            this.$('.back').click(function(){
                self.gui.show_screen(self.back_screen);
            });

            var contents = this.$el[0].querySelector('.wk-screen-content');
            contents.innerHTML = "";
            for(var i = 0, len = Math.min(product_data.length,1000); i < len; i++){
                console.log(self.pos.config.wk_pricelist);
                var productline;
                var productline_html = QWeb.render('wk-product-lines',{widget: this, data:product_data[i]});
                var productline = document.createElement('tbody');
                productline.innerHTML = productline_html;
                productline = productline.childNodes[1];
                contents.appendChild(productline);
            }
        },

        show: function(){
            var self = this;
            this._super();
            this.renderElement();

            this.$('.wk_add_to_order').click(function(event){
                var product_id = parseInt($(this).attr('product_id'));
                var pricelist_id = parseInt($(this).attr('pricelist_id'));
                var price = parseFloat($(this).attr('price'));
                var quantity = parseFloat($(this).attr('quantity'));
                var product = self.pos.db.get_product_by_id(product_id);
                self.pos.get_order().add_product(product,{ quantity: quantity, 'price': price });
                self.gui.show_screen(self.back_screen);                  
            });
        },        
    });

    gui.define_screen({name:'selectProduct', widget: SelectProductScreenWidget});

});