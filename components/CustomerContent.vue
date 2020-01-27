<template>
    <div class="customer_tab_content">
        <div v-if="type == 'packages' && loaded">
            <div class="cms_table_toggler">
                <div :class="`status ${(packageStatus == 1) ? 'active' : ''}`" @click="togglePackages(1)">Owned</div>
                <div :class="`status ${(packageStatus == 2) ? 'active' : ''}`" @click="togglePackages(2)">Shared</div>
            </div>
            <div class="cms_table_package">
                <div class="table_package" v-for="(data, key) in value.user_package_counts" :key="key" v-if="value.user_package_counts.length > 0">
                    <h2 class="package_title">
                        {{ data.class_package.name }}
                        <span class="warning" v-if="checkWarning(data)">{{ violator.warning }} Days Left</span>
                        <span class="shared">Shared with Sheena Villeta</span>
                    </h2>
                    <div class="package_details">
                        <div class="package_status">
                            <div class="box">
                                <div class="overlay">
                                    <p>{{ parseInt(data.class_package.class_count) - parseInt(data.count) }}</p>
                                    <label>Used</label>
                                </div>
                            </div>
                            <div class="box margin">
                                <div class="overlay">
                                    <p>{{ (data.class_package.class_count_unlimited == 1) ? 'Unlimited' : (parseInt(data.count) == data.class_package.class_count) ? parseInt(data.class_package.class_count) : parseInt(data.count) }}</p>
                                    <label>Available</label>
                                </div>
                            </div>
                        </div>
                        <div class="package_date">
                            <div class="date">
                                <p>{{ formatDate(data.created_at, false) }} / {{ (data.activation_date != 'NA') ? formatDate(data.activation_date, false) : 'N/A' }}</p>
                                <label>Purchase Date / Activation Date</label>
                            </div>
                            <div class="date margin">
                                <p>{{ formatDate(data.class_package.computed_expiration_date, false) }}</p>
                                <label>Expiry date <a href="javascript:void(0)" class="expiry_btn">Edit</a></label>
                            </div>
                        </div>
                        <div class="package_action">
                            <a href="/booker" class="action_success_btn" @click.prevent="getCurrentCustomer()">Book a Class</a>
                            <div class="package_options">
                                <div class="option_btn" :id="`option_${key}`" @click.self="toggledOption($event)">Options</div>
                                <div class="option_selector">
                                    <a href="javascript:void(0)" class="option_link">Transfer Package</a>
                                    <a href="javascript:void(0)" class="option_link">Share Package</a>
                                    <a href="javascript:void(0)" class="option_link">Freeze Package</a>
                                    <a href="javascript:void(0)" class="option_link">Print Receipt</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="no_results" v-if="value.user_package_counts.length == 0">
                    No Package(s) Found.
                </div>
            </div>
        </div>
        <div v-if="type == 'badges'">
            <div class="cms_col_five">
                <div class="cms_col" v-for="n in 10">
                    <div class="wrapper">
                        <div class="badge"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="237.742" height="231.966" viewBox="0 0 237.742 231.966"><defs><style>.a{fill:url(#a);}.b{fill:url(#b);}.c{fill:url(#c);}.d{fill:none;stroke:#f7344a;stroke-miterlimit:10;stroke-width:0.5px;}.e{fill:url(#d);}.f{opacity:0.5;mix-blend-mode:overlay;isolation:isolate;fill:url(#e);}.g{fill:#fff;}</style><radialGradient id="a" cx="0.739" cy="0.065" r="0.846" gradientTransform="translate(0.021) scale(0.958 1)" gradientUnits="objectBoundingBox"><stop offset="0" stop-color="#ff9161"/><stop offset="1" stop-color="#f7344a"/></radialGradient><radialGradient id="b" cx="0.739" cy="0.065" r="0.846" gradientTransform="translate(0.021) scale(0.958 1)" gradientUnits="objectBoundingBox"><stop offset="0" stop-color="#9d578a"/><stop offset="1" stop-color="#f7344a"/></radialGradient><radialGradient id="c" cx="0.937" cy="-0.176" r="1.11" gradientTransform="translate(0.021) scale(0.958 1)" gradientUnits="objectBoundingBox"><stop offset="0.002" stop-color="#29467f"/><stop offset="1" stop-color="#7f2816"/></radialGradient><radialGradient id="d" cx="0.812" cy="-0.062" r="0.956" xlink:href="#b"/><linearGradient id="e" x1="0.549" y1="0.052" x2="0.394" y2="0.69" gradientUnits="objectBoundingBox"><stop offset="0.002" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs><g transform="translate(9.24)"><path class="a" d="M670.726,677.88c0,10.237-11.521,18.529-14.521,27.766-3.109,9.574,1.232,23.033-4.567,31-5.857,8.048-20.04,8.051-28.088,13.907-7.969,5.8-12.32,19.319-21.895,22.428-9.237,3-20.663-5.281-30.9-5.281s-21.664,8.279-30.9,5.28c-9.574-3.108-13.927-16.626-21.9-22.427-8.047-5.858-22.229-5.86-28.087-13.907-5.8-7.969-1.459-21.43-4.566-31-3-9.239-14.523-17.529-14.523-27.766s11.523-18.527,14.523-27.765c3.109-9.573-1.233-23.034,4.567-31,5.856-8.047,20.038-8.05,28.087-13.908,7.969-5.8,12.321-19.318,21.894-22.427,9.238-3,20.663,5.282,30.9,5.282s21.663-8.281,30.9-5.282c9.573,3.109,13.926,16.628,21.894,22.427,8.049,5.857,22.23,5.86,28.087,13.909,5.8,7.969,1.458,21.428,4.567,31C659.2,659.353,670.726,667.643,670.726,677.88Z" transform="translate(-461.124 -560.571)"/><path class="b" d="M684.85,672.477c0,11.3-12.724,20.459-16.035,30.658-3.433,10.572,1.36,25.435-5.043,34.234-6.467,8.886-22.127,8.889-31.015,15.356-8.8,6.4-13.605,21.333-24.176,24.765-10.2,3.312-22.817-5.832-34.12-5.832s-23.922,9.144-34.121,5.832c-10.572-3.432-15.379-18.361-24.178-24.765-8.886-6.468-24.547-6.471-31.014-15.357-6.4-8.8-1.609-23.662-5.042-34.233-3.312-10.2-16.037-19.355-16.037-30.658s12.725-20.46,16.037-30.66c3.433-10.572-1.361-25.433,5.042-34.232,6.469-8.888,22.129-8.889,31.015-15.358,8.8-6.4,13.605-21.331,24.177-24.763,10.2-3.312,22.816,5.831,34.121,5.831s23.92-9.143,34.12-5.831c10.572,3.432,15.377,18.36,24.177,24.763,8.888,6.468,24.546,6.471,31.015,15.359,6.4,8.8,1.61,23.661,5.042,34.232C672.126,652.016,684.85,661.172,684.85,672.477Z" transform="translate(-463.817 -566.74)"/><path class="c" d="M664.413,668.121c0,9.677-10.893,17.515-13.728,26.246-2.938,9.051,1.166,21.773-4.317,29.307-5.537,7.607-18.943,7.61-26.551,13.146-7.533,5.482-11.646,18.262-20.7,21.2-8.732,2.835-19.532-4.993-29.209-4.993s-20.479,7.828-29.211,4.993c-9.05-2.937-13.164-15.718-20.7-21.2-7.609-5.537-21.015-5.538-26.551-13.147-5.482-7.532-1.378-20.254-4.317-29.305-2.836-8.732-13.727-16.569-13.727-26.246s10.891-17.515,13.727-26.246c2.939-9.051-1.165-21.773,4.318-29.306,5.537-7.608,18.943-7.61,26.55-13.146,7.533-5.482,11.647-18.261,20.7-21.2,8.732-2.835,19.532,4.992,29.211,4.992s20.478-7.827,29.209-4.992c9.051,2.939,13.165,15.718,20.7,21.2,7.607,5.537,21.013,5.539,26.55,13.146,5.482,7.533,1.379,20.256,4.317,29.306C653.521,650.606,664.413,658.443,664.413,668.121Z" transform="translate(-459.269 -562.385)"/><path class="d" d="M647.873,664.595c0,8.36-9.41,15.13-11.861,22.675-2.539,7.819,1.007,18.811-3.729,25.318-4.783,6.572-16.365,6.574-22.937,11.358-6.507,4.735-10.063,15.776-17.881,18.315-7.544,2.449-16.875-4.314-25.234-4.314S548.54,744.709,541,742.26c-7.817-2.538-11.372-13.58-17.881-18.316-6.572-4.783-18.154-4.784-22.937-11.358-4.736-6.507-1.19-17.5-3.729-25.317-2.449-7.544-11.86-14.315-11.86-22.675s9.411-15.132,11.86-22.676c2.538-7.818-1.006-18.81,3.729-25.318,4.785-6.573,16.365-6.574,22.938-11.357,6.508-4.737,10.062-15.777,17.881-18.315,7.543-2.45,16.873,4.312,25.235,4.312s17.692-6.762,25.234-4.312c7.819,2.538,11.373,13.578,17.881,18.315,6.573,4.783,18.154,4.785,22.938,11.357,4.735,6.507,1.191,17.5,3.728,25.318C638.463,649.463,647.873,656.234,647.873,664.595Z" transform="translate(-455.589 -558.859)"/><path class="e" d="M628.953,660.563c0,6.854-7.715,12.4-9.723,18.589-2.082,6.41.825,15.421-3.058,20.755-3.922,5.388-13.416,5.389-18.8,9.312-5.335,3.882-8.251,12.933-14.66,15.014-6.184,2.008-13.833-3.536-20.687-3.536s-14.5,5.544-20.688,3.536c-6.41-2.081-9.324-11.132-14.659-15.016-5.389-3.921-14.884-3.923-18.805-9.311-3.882-5.334-.977-14.347-3.057-20.757-2.009-6.184-9.723-11.734-9.723-18.588s7.714-12.405,9.723-18.589c2.08-6.41-.825-15.422,3.057-20.757,3.921-5.388,13.417-5.39,18.805-9.311,5.335-3.883,8.249-12.934,14.659-15.016,6.184-2.007,13.835,3.536,20.688,3.536s14.5-5.543,20.688-3.536c6.41,2.082,9.324,11.134,14.658,15.016,5.388,3.921,14.882,3.923,18.805,9.312,3.882,5.335.975,14.346,3.057,20.756C621.237,648.158,628.953,653.709,628.953,660.563Z" transform="translate(-451.379 -554.827)"/><path class="f" d="M540.158,777.5c.245.079.5.119.747.184l71.462-208.241a16.1,16.1,0,0,0-3.966-1.971c-10.2-3.312-22.818,5.832-34.122,5.832s-23.92-9.144-34.12-5.832c-10.572,3.432-15.379,18.361-24.177,24.765-8.888,6.466-24.548,6.469-31.015,15.357-6.4,8.8-1.611,23.661-5.043,34.232-3.312,10.2-16.035,19.356-16.035,30.66s12.723,20.458,16.035,30.659c3.432,10.57-1.362,25.433,5.042,34.233,6.468,8.886,22.129,8.889,31.015,15.357C524.781,759.142,529.587,774.07,540.158,777.5Z" transform="translate(-463.889 -566.735)"/><g transform="translate(58.649 87.147)"><path class="g" d="M539.071,647.736c0-11.758,4.991-18.791,13.745-18.791s13.743,7.033,13.743,18.791-5,18.79-13.743,18.79S539.071,659.494,539.071,647.736Zm18.843,0c0-7.034-1.825-11.006-5.1-11.006s-5.1,3.972-5.1,11.006c0,7.086,1.826,11.006,5.1,11.006S557.914,654.823,557.914,647.736Z" transform="translate(-492.392 -628.945)"/><path class="g" d="M560.354,647.736c0-11.758,4.991-18.791,13.744-18.791s13.744,7.033,13.744,18.791-5,18.79-13.744,18.79S560.354,659.494,560.354,647.736Zm18.843,0c0-7.034-1.824-11.006-5.1-11.006s-5.1,3.972-5.1,11.006c0,7.086,1.826,11.006,5.1,11.006S579.2,654.823,579.2,647.736Z" transform="translate(-483.858 -628.945)"/><path class="g" d="M517.887,647.736c0-11.758,4.991-18.791,13.745-18.791s13.744,7.033,13.744,18.791-5,18.79-13.744,18.79S517.887,659.494,517.887,647.736Zm18.843,0c0-7.034-1.824-11.006-5.1-11.006s-5.1,3.972-5.1,11.006c0,7.086,1.826,11.006,5.1,11.006S536.73,654.823,536.73,647.736Z" transform="translate(-500.886 -628.945)"/><path class="g" d="M511.961,640.436h-5.229a1.023,1.023,0,0,1-.981-1.034v-3.431a1.536,1.536,0,0,1,.327-.817l7.95-6.208h5.011a1.024,1.024,0,0,1,.979,1.034v34.965a1.023,1.023,0,0,1-.979,1.034H513a1.032,1.032,0,0,1-1.034-1.034Z" transform="translate(-505.752 -628.945)"/></g></g></svg></div>
                        <div class="info">
                            <h2>Ride to Batangas</h2>
                            <p>Earned on: Apr 23, 2020</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="type == 'upcoming-classes' && loaded">
            <table class="cms_table">
                <thead>
                    <tr>
                        <th>Date &amp; time</th>
                        <th>Bike No.</th>
                        <th>Class</th>
                        <th>Studio</th>
                        <th>instructor</th>
                        <th>Guests</th>
                        <th>Status</th>
                        <th>Series ID</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(n, key) in 3" :key="key">
                        <td><div class="table_data_link link" @click="toggleLayout(n, 21550)">{{ formatClassDate('January 01, 2020 12:00', true) }}</div></td>
                        <td>5</td>
                        <td>Ride Rev</td>
                        <td>Greenbelt 5</td>
                        <td>
                            <div class="thumb">
                                <!-- <img :src="data.customer_details.images[0].path_resized" v-if="data.customer_details.images.length > 0" /> -->
                                <div class="table_image_default">
                                    CR
                                </div>
                                <nuxt-link class="table_data_link" to="/">Billie Capistrano</nuxt-link>
                            </div>
                        </td>
                        <td>
                            <div class="table_select" v-if="key != 1">
                                <div :id="`table_select_${key}`" class="table_select_label" @click="toggleGuest($event)">3 Guests</div>
                                <div class="overlay">
                                    <ul>
                                        <li v-line-clamp="1">16 - Sample Name</li>
                                        <li v-line-clamp="1">4 - Jennifer Castillo</li>
                                        <li v-line-clamp="1">1 - Edcel Games</li>
                                    </ul>
                                </div>
                            </div>
                        </td>
                        <td>Completed</td>
                        <td>
                            <p>Singe Class Package</p>
                            <p class="id">854585961462367501</p>
                        </td>
                        <td class="table_actions full">
                            <div class="table_action_success link" @click="getCurrentCustomer()">Sign In</div>
                        </td>
                    </tr>

                </tbody>
                <!-- <tbody class="no_results" v-else>
                    <tr>
                        <td :colspan="rowCount">No Result(s) Found.</td>
                    </tr>
                </tbody> -->
            </table>
            <!-- <pagination :apiRoute="res.customers.path" :current="res.customers.current_page" :last="res.customers.last_page" /> -->
        </div>
        <div v-if="type == 'class-history' && loaded">
            <div class="actions">
                <div class="total">Total: 4</div>
                <div class="cms_table_toggler">
                    <div :class="`status ${(classesHistoryStatus == 1) ? 'active' : ''}`" @click="toggleClassesHistory(1)">All</div>
                    <div :class="`status ${(classesHistoryStatus == 2) ? 'active' : ''}`" @click="toggleClassesHistory(2)">Completed</div>
                    <div :class="`status ${(classesHistoryStatus == 3) ? 'active' : ''}`" @click="toggleClassesHistory(3)">No Show</div>
                    <div :class="`status ${(classesHistoryStatus == 4) ? 'active' : ''}`" @click="toggleClassesHistory(4)">Cancelled</div>
                </div>
            </div>
            <table class="cms_table">
                <thead>
                    <tr>
                        <th>Date &amp; time</th>
                        <th>Bike No.</th>
                        <th>Class</th>
                        <th>Studio</th>
                        <th>instructor</th>
                        <th>Guests</th>
                        <th>Status</th>
                        <th>Series ID</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(n, key) in 3"  :key="key">
                        <td>{{ formatClassDate('January 01, 2020 12:00', true) }}</td>
                        <td>5</td>
                        <td>Ride Rev</td>
                        <td>Greenbelt 5</td>
                        <td>
                            <div class="thumb">
                                <!-- <img :src="data.customer_details.images[0].path_resized" v-if="data.customer_details.images.length > 0" /> -->
                                <div class="table_image_default">
                                    CR
                                </div>
                                <nuxt-link class="table_data_link" to="/">Billie Capistrano</nuxt-link>
                            </div>
                        </td>
                        <td>
                            <div class="table_select" v-if="key != 1">
                                <div :id="`table_select_${key}`" class="table_select_label" @click="toggleGuest($event)">3 Guests</div>
                                <div class="overlay">
                                    <ul>
                                        <li v-line-clamp="1">16 - Sample Name</li>
                                        <li v-line-clamp="1">4 - Jennifer Castillo</li>
                                        <li v-line-clamp="1">1 - Edcel Games</li>
                                    </ul>
                                </div>
                            </div>
                        </td>
                        <td>Completed</td>
                        <td>
                            <p>Singe Class Package</p>
                            <p class="id">854585961462367501</p>
                        </td>
                    </tr>

                </tbody>
                <!-- <tbody class="no_results" v-else>
                    <tr>
                        <td :colspan="rowCount">No Result(s) Found.</td>
                    </tr>
                </tbody> -->
            </table>
            <!-- <pagination :apiRoute="res.customers.path" :current="res.customers.current_page" :last="res.customers.last_page" /> -->
        </div>
        <div v-if="type == 'transactions' && loaded">
            <div class="cms_table_accordion alt">
                <div class="header_wrapper">
                    <div class="accordion_header">Transanction Date</div>
                    <div class="accordion_header">Branch</div>
                    <div class="accordion_header">Total Qty.</div>
                    <div class="accordion_header">Payment Method</div>
                    <div class="accordion_header">Total Price</div>
                    <div class="accordion_header action">Status</div>
                </div>
                <div :class="`content_wrapper ${(data.open) ? 'toggled' : ''} ${(data.status == 'paid') ? 'alt' : ''}`" v-for="(data, key) in res.data" v-if="res.data.length > 0">
                    <div class="toggler" @click="toggleAccordion($event, key)"></div>
                    <div class="content_headers">
                        <div class="accordion_content">{{ formatDate(data.created_at, true) }}</div>
                        <div class="accordion_content">{{ data.studio.name }}</div>
                        <div class="accordion_content">{{ countVariantQty(data.payment_items) }}</div>
                        <div class="accordion_content capital">{{ replacer(data.payment_method.method) }}</div>
                        <div :class="`accordion_content ${(data.status == 'pending') ? 'red' : ''}`">Php {{ totalCount(data.total) }}</div>
                        <div class="accordion_actions action">
                            <div :class="`action_status ${(data.status == 'paid') ? 'green' : 'red' }`">{{ data.status }}</div>
                            <a class="accordion_action_edit" href="javascript:void(0)" @click="toggleForm(data.id)" v-if="data.status == 'pending'">Pay Now</a>
                        </div>
                    </div>
                    <div class="accordion_table">
                        <table class="cms_table">
                            <thead>
                                <tr>
                                    <th class="padding_left">Product</th>
                                    <th>Category</th>
                                    <th>Qty</th>
                                    <th>Price</th>
                                </tr>
                            </thead>
                            <tbody v-if="data.payment_items.length > 0">
                                <tr v-for="(item, key) in data.payment_items" :key="key">
                                    <td class="padding_left"><b>{{ (item.type == 'custom-gift-card') ? 'Digital Gift Card - ' : (item.type == 'physical-gift-card' ? 'Physical Gift Card - ' : '') }}</b> {{ (item.product_variant) ? `${item.product_variant.product.name} ${item.product_variant.variant}` : (item.class_package ? item.class_package.name : (item.store_credit ? item.store_credit.name : item.gift_card.card_code )) }}</td>
                                    <td>{{ (item.product_variant) ? item.product_variant.product.category.name : 'N/A' }}</td>
                                    <td>{{ item.quantity }}</td>
                                    <td class="price">
                                        <p :class="`${(data.promo_code_used !== null) ? 'prev_price' : ''}`" >PHP {{ totalCount(item.total) }}</p>
                                        <p v-if="data.promo_code_used !== null">PHP {{ totalCount(item.originalTotal) }}</p>
                                    </td>
                                </tr>
                            </tbody>
                            <tbody class="no_results" v-else>
                                <tr>
                                    <td :colspan="rowCount">No Result(s) Found.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="no_results" v-if="res.data.length == 0">
                    No Result(s) Found.
                </div>
            </div>
            <pagination :apiRoute="`api/customers/${$route.params.param}/${$route.params.slug}`" :current="res.current_page" :last="res.last_page" :total="res.total" />
            <button type="button" class="hidden" id="transactions" @click="populateTransactions()"></button>
        </div>
        <div v-if="type == 'details' && loaded">
            <div id="default_form">
                <div class="form_wrapper">
                    <div class="form_header_wrapper">
                        <h2 class="form_title">Customer Overview</h2>
                        <div class="form_check toggler">
                            <input type="hidden" id="is_promo" name="is_promo" class="action_check" :value="(isActivated) ? 1 : 0">
                            <div :class="`toggle ${(isActivated) ? 'active' : ''}`" @click="toggledPrompt()"></div>
                            <label for="is_promo">{{ (isActivated) ? 'Activated' : 'Deactivated' }}</label>
                        </div>
                    </div>
                    <div class="form_overview">
                        <div class="wrapper">
                            <label>Name</label>
                            <p>{{ value.first_name }} {{ value.last_name }}</p>
                        </div>
                        <div class="wrapper">
                            <label>Email</label>
                            <p>{{ value.email }}</p>
                        </div>
                        <div class="wrapper">
                            <label>Password</label>
                            <p>*******</p>
                        </div>
                        <div class="wrapper">
                            <label>Phone Number</label>
                            <p>{{ value.customer_details.co_contact_number }}</p>
                        </div>
                        <div class="wrapper">
                            <label>Birthdate</label>
                            <p>{{ formatClassDate(value.customer_details.co_birthdate, false) }}</p>
                        </div>
                        <div class="wrapper">
                            <label>Gender</label>
                            <p>{{ value.customer_details.co_sex }}</p>
                        </div>
                        <div class="wrapper">
                            <label>Occupation</label>
                            <p>{{ value.customer_details.occupation_id }}</p>
                        </div>
                        <div class="wrapper">
                            <label>Customer Type</label>
                            <p>{{ value.type }}</p>
                        </div>
                        <div class="wrapper">
                            <label>Rewards Membership</label>
                            <p>Black</p>
                        </div>
                    </div>
                </div>
                <div class="form_wrapper">
                    <div class="form_header_wrapper">
                        <h2 class="form_title">Personal Address</h2>
                    </div>
                    <div class="form_overview">
                        <div class="wrapper">
                            <label>Address</label>
                            <p>{{ value.customer_details.pa_address_1 }}, {{ value.customer_details.pa_address_2 }}</p>
                        </div>
                        <div class="wrapper">
                            <label>City</label>
                            <p>{{ value.customer_details.pa_city }}</p>
                        </div>
                    </div>
                </div>
                <div class="form_wrapper">
                    <div class="form_header_wrapper">
                        <h2 class="form_title">Billing Address</h2>
                    </div>
                    <div class="form_overview">
                        <div class="wrapper">
                            <label>Address</label>
                            <p>{{ value.customer_details.ba_address_1 }}, {{ value.customer_details.ba_address_2 }}</p>
                        </div>
                        <div class="wrapper">
                            <label>City</label>
                            <p>{{ value.customer_details.ba_city }}</p>
                        </div>
                    </div>
                </div>
                <div class="form_wrapper">
                    <div class="form_header_wrapper">
                        <h2 class="form_title">Top 5 Instructors</h2>
                    </div>
                    <div class="form_overview_instructor">
                        <div class="left">
                            <div class="image">
                                <div class="instructor_image"></div>
                                <div class="sequence"><span>1</span></div>
                            </div>
                            <h2>Bruce Lee</h2>
                            <p>Total Rides: 10</p>
                        </div>
                        <div class="right">
                            <div class="wrapper">
                                <div class="image">
                                    <div class="instructor_image"></div>
                                    <div class="sequence"><span>2</span></div>
                                </div>
                                <div class="info">
                                    <h2>Bruce Lee</h2>
                                    <p>Total Rides: 10</p>
                                </div>
                            </div>
                            <div class="wrapper">
                                <div class="image">
                                    <div class="instructor_image"></div>
                                    <div class="sequence"><span>3</span></div>
                                </div>
                                <div class="info">
                                    <h2>Bruce Lee</h2>
                                    <p>Total Rides: 10</p>
                                </div>
                            </div>
                            <div class="wrapper">
                                <div class="image">
                                    <div class="instructor_image"></div>
                                    <div class="sequence"><span>4</span></div>
                                </div>
                                <div class="info">
                                    <h2>Bruce Lee</h2>
                                    <p>Total Rides: 10</p>
                                </div>
                            </div>
                            <div class="wrapper">
                                <div class="image">
                                    <div class="instructor_image"></div>
                                    <div class="sequence"><span>5</span></div>
                                </div>
                                <div class="info">
                                    <h2>Bruce Lee</h2>
                                    <p>Total Rides: 10</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <transition name="fade">
            <customer-pending-quick-sale :value="transaction" v-if="$store.state.customerPendingQuickSaleStatus" />
        </transition>
        <transition name="fade">
            <customer-prompt :status="promptMessage" v-if="$store.state.customerPromptStatus" />
        </transition>
    </div>
</template>

<script>
    import CustomerPrompt from '../components/modals/CustomerPrompt'
    import CustomerPendingQuickSale from '../components/modals/CustomerPendingQuickSale'
    import Pagination from '../components/Pagination'
    export default {
        components: {
            CustomerPrompt,
            CustomerPendingQuickSale,
            Pagination
        },
        props: {
            type: {
                type: String,
                default: 'packages'
            },
            value: {
                default: null
            }
        },
        data () {
            return {
                rowCount: 0,
                promptMessage: '',
                isActivated: true,
                loaded: false,
                violator: {
                    warning: 0,
                    shared: 0,
                    transferred: 0,
                    freeze: 0,
                },
                packageStatus: 1,
                classesHistoryStatus: 1,
                res: [],
                transaction: []
            }
        },
        methods: {
            toggleLayout (studioId, scheduledDateID) {
                const me = this
                me.loader(true)
                me.$parent.layout.studio = studioId
                me.$parent.layout.schedule = scheduledDateID
                me.$store.state.upcomingClassesLayoutStatus = true
            },
            toggledPrompt () {
                const me = this
                me.isActivated ^= true
                if (me.isActivated) {
                    me.promptMessage = 'Activate'
                } else {
                    me.promptMessage = 'Deactivate'
                }
                me.$store.state.customerPromptStatus = true
                document.body.classList.add('no_scroll')
            },
            toggleGuest (event) {
                const me = this
                let element = event.target
                if (element.nextElementSibling.classList.contains('active')) {
                    element.nextElementSibling.classList.remove('active')
                } else {
                    element.nextElementSibling.classList.add('active')
                }
            },
            populateTransactions () {
                const me = this
                me.$axios.get(`api/customers/${me.$route.params.param}/${me.$route.params.slug}`).then(res => {
                    if (res.data) {
                        me.res = res.data.customer.payments
                        if (me.res) {
                            me.$parent.pendingPayment = 0
                            me.res.data.forEach((payment, index) => {
                                if (payment.status == 'pending') {
                                    me.$parent.pendingPayment += parseFloat(payment.total)
                                }
                            })
                        }
                    }
                })
            },
            toggleForm (id) {
                const me = this
                me.$axios.get(`api/show-payment/${id}`).then(res => {
                    if (res.data) {
                        me.transaction = res.data.payment
                        me.$store.state.customerID = me.$route.params.param
                        me.$store.state.customerPendingQuickSaleStatus = true
                        document.body.classList.add('no_scroll')
                    }
                })
            },
            countVariantQty (items) {
                const me = this
                let ctr = 0
                items.forEach((item, index) => {
                    ctr += parseInt(item.quantity)
                })
                return ctr
            },
            toggleAccordion (event, key) {
                const me = this
                const target = event.target
                me.res.data[key].open ^= true
                if (me.res.data[key].open) {
                    target.parentNode.querySelector('.accordion_table').style.height = `${target.parentNode.querySelector('.accordion_table').scrollHeight}px`
                } else {
                    target.parentNode.querySelector('.accordion_table').style.height = 0
                }
            },
            getCurrentCustomer () {
                const me = this
                me.$axios.get(`api/customers/${me.$route.params.param}`).then(res => {
                    if (res.data) {
                        me.$store.state.customer = res.data.user
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                })
                me.$router.push('/booker')
            },
            formatDate (value, withTime) {
                if (value) {
                    if (withTime) {
                        return this.$moment(value).format('MMM DD, YYYY hh:mm A')
                    } else {
                        return this.$moment(value).format('MMM DD, YYYY')
                    }
                }
            },
            formatClassDate (value, withTime) {
                if (value) {
                    if (withTime) {
                        return this.$moment(value).format('M/D/YY (ddd) h:mm A')
                    } else {
                        return this.$moment(value).format('MMMM DD, YYYY')
                    }
                }
            },
            checkWarning (data) {
                const me = this
                let expiry = me.$moment(data.class_package.computed_expiration_date)
                let current = me.$moment()
                if (parseInt(expiry.diff(current, 'days')) <= 15) {
                    me.violator.warning = expiry.diff(current, 'days')
                    return true
                } else {
                    return false
                }
            },
            toggledOption (event) {
                const me = this
                let element = event.target
                if (element.parentNode.classList.contains('toggled')) {
                    element.parentNode.classList.remove('toggled')
                } else {
                    element.parentNode.classList.add('toggled')
                }
            },
            toggleOverlays (e) {
                const me = this
                let target = e.target
                if (me.value.user_package_counts) {
                    me.value.user_package_counts.forEach((result, index) => {
                        let option = document.getElementById(`option_${index}`)
                        if (option != null) {
                            if (option !== target && option !== target.parentNode.previousElementSibling) {
                                if (option.parentNode.classList.contains('toggled')) {
                                    option.parentNode.classList.remove('toggled')
                                }
                            }
                        }
                    })
                }
                if (me.$route.params.slug == 'class-history') {
                    for (let i = 0; i <= 2; i++) {
                        let element = document.getElementById(`table_select_${i}`)
                        if (element !== target) {
                            if (element.nextElementSibling.classList.contains('active')) {
                                element.nextElementSibling.classList.remove('active')
                            }
                        }
                    }
                }
            },
            togglePackages (status) {
                const me = this
                return me.packageStatus = status
            },
            toggleClassesHistory (status) {
                const me = this
                return me.classesHistoryStatus = status
            },
        },
        mounted () {
            const me = this
            if (me.$route.params.slug == 'transactions') {
                me.res = me.value.payments
            }
            me.rowCount = document.getElementsByTagName('th').length
            me.loaded = true
        },
        beforeMount () {
            document.addEventListener('click', this.toggleOverlays)
        },
        beforeDestroy () {
            document.removeEventListener('click', this.toggleOverlays)
        }
    }
</script>
