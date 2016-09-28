# -*- encoding: UTF-8 -*-
##############################################################################
#
#    Odoo, Open Source Management Solution
#    Copyright (C) 2015-Today Key Concepts IT Services LLP.
#    (<http://keyconcepts.co.in>)
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

{
    'name': 'Pos Product Pack ',
    'category': 'POS Hidden',
    'version': '1.0',
    'description':
        """
    Odoo Web core module.
    ========================

    This module provides the pos screen on display  product pack.
        """,
    'depends': ['point_of_sale'],
    'data': [
        'security/ir.model.access.csv',
        'views/pos_product_pack_view.xml',
        'views/pos_pack_template_view.xml',
    ],
    'qweb': ['static/src/xml/pos_template.xml'],
    'installable': True,
    'auto_install': False,
    'application': True,
}
