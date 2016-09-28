# -*- encoding: UTF-8 -*-
##############################################################################
#
#    Odoo, Open Source Management Solution
#    Copyright (C) 2015-Today Laxicon Solution.
#    (<http://laxicon.in>)
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU General Public License as published by
#    the Free Software Foundation, either version 3 of the License, or
#    (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU General Public License for more details.
#
#    You should have received a copy of the GNU General Public License
#    along with this program.  If not, see <http://www.gnu.org/licenses/>
#
##############################################################################


from openerp import api, fields, models, _
from openerp.exceptions import UserError


class ProductPack(models.Model):
    _name = "product.pack"
    _description = "Product packs"

    name = fields.Char('name')
    wk_product_template = fields.Many2one('product.template', 'Item')
    product_quantity = fields.Float('Quantity', default='1', required=True)
    product_name = fields.Many2one('product.product', string='Product', required=True)
    uom_id = fields.Many2one('product.uom', 'Unit of measure')
    price = fields.Float('Product_price')


class ProductTemplate(models.Model):
    _inherit = "product.template"

    is_pack = fields.Boolean('Is Combo?', default=False)
    wk_product_pack = fields.One2many('product.pack', 'wk_product_template', 'Items in the pack')

    @api.model
    def create(self, vals):
        res = super(ProductTemplate, self).create(vals)
        if res.is_pack:
            if not res.wk_product_pack:
                raise UserError(_('Please select combo pack line.'))
        return res
