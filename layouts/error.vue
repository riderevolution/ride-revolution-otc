<template>
    <div class="error_page">
    	<div class="container" v-if="error.statusCode == 404">
            <div class="logo">
                <img src="/logo.png" />
            </div>
    		<h1 class="header_title">Error 404</h1>
        	<h2 class="header_subtitle">The page you are trying to visit does not exist.</h2>
        	<nuxt-link to="/" class="action_btn"><span>Back to Home</span></nuxt-link>
    	</div>
        <div class="container" v-else>
            <div class="logo">
                <img src="/logo.png" />
            </div>
        	<h1 class="header_title">Oops, Something Went Wrong!</h1>
        	<nuxt-link to="/" class="action_btn"><span>Back to Dashboard</span></nuxt-link>
        </div>
    </div>
</template>

<script>
	export default {
		props: ['error'],
		layout: 'default'
	}
</script>
