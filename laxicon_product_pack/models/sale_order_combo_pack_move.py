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

from openerp import api, models


class SaleOrderPackMove(models.Model):
    _inherit = "sale.order"
    _description = "Sale Order Combo"

    @api.model
    def create(self, vals):
        result = super(SaleOrderPackMove, self).create(vals)
        for res in result.order_line:
            # it will check for combo pack product
            if res.product_id.is_pack:
                for combo in res.product_id.wk_product_pack:
                    # it will add in sale order line combo product with 0 price
                    res.create({
                        'product_id': combo.product_name.id,
                        'name': "[Combo Product]" + combo.product_name.name,
                        'product_uom_qty': combo.product_quantity * res.product_uom_qty,
                        'price_unit': 0,
                        'product_uom': combo.product_name.uom_id.id,
                        'order_id': result.id
                    })
        return result
