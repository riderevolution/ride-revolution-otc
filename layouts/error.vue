<template>
    <div class="error_page">
    	<div class="container" v-if="error.statusCode == 404">
            <div class="logo">
                <img src="/logo.png" />
            </div>
    		<h1 class="header_title">Error 404</h1>
        	<h2 class="header_subtitle">The page you are trying to visit does not exist.</h2>
        	<nuxt-link :to="`${(isAdmin) ? '/' : '/instructor/class-schedules'}`" class="action_btn"><span>Back to Dashboard</span></nuxt-link>
    	</div>
    	<div class="container" v-else-if="error.statusCode == 403">
            <div class="logo">
                <img src="/logo.png" />
            </div>
    		<h1 class="header_title">Error 403</h1>
        	<h2 class="header_subtitle">You don't have access to this page.</h2>
        	<nuxt-link :to="`${(isAdmin) ? '/' : '/instructor/class-schedules'}`" class="action_btn"><span>Back to Dashboard</span></nuxt-link>
    	</div>
        <div class="container" v-else>
            <div class="logo">
                <img src="/logo.png" />
            </div>
        	<h1 class="header_title">Oops, Something Went Wrong!</h1>
        	<nuxt-link :to="`${(isAdmin) ? '/' : '/instructor/class-schedules'}`" class="action_btn"><span>Back to Dashboard</span></nuxt-link>
        </div>
    </div>
</template>

<script>
	export default {
		props: ['error'],
        data () {
            return {
                isAdmin: true
            }
        },
        mounted () {
            const me = this
            let token = me.$cookies.get('70hokcotc3hhhn5')
            me.$axios.get('api/user', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }).then(res => {
                if (res.data.user.type != 0) {
                    me.isAdmin = false
                }
            }).catch(err => {
                console.log(err);
            })
        }
	}
</script>
