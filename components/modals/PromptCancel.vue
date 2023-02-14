<template>
  <div class="default_modal">
    <div class="background" @click.once="toggleClose(false)"></div>
    <div class="confirmation_wrapper">
      <div class="confirmation_text">Are you sure you want to continue?</div>
      <div class="button_group">
        <a
          href="javascript:void(0)"
          class="action_cancel_btn"
          @click.once="toggleClose(false)"
        >
          Cancel
        </a>
        <div
          class="action_success_btn confirm margin alternate"
          @click.once="toggleClose(true)"
        >
          Confirm
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    methods: {
      toggleClose(status) {
        const me = this
        if (status) {
          let token = me.$cookies.get('70hokcotc3hhhn5')
          me.loader(true)
          me.$axios
            .delete(`api/bookings/${me.$store.state.bookingID}`, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            })
            .then(res => {
              if (res.data) {
                setTimeout(() => {
                  if (res.data.hasGuests == 1) {
                    me.$parent.actionMessage =
                      'Booking has been successfully cancelled, including the guest(s).'
                  } else {
                    me.$parent.actionMessage =
                      'Booking has been successfully cancelled.'
                  }
                  me.$store.state.promptBookerActionStatus = true
                }, 500)
              }
            })
            .catch(err => {
              me.$store.state.errorList = err.response.data.errors
              me.$store.state.errorStatus = true
            })
            .then(() => {
              me.$store.state.bookingID = 0
              me.$store.state.seat = ''
              me.$store.state.promptCancelStatus = false
              setTimeout(() => {
                me.$parent.getSeats()
              }, 500)
            })
        } else {
          me.$store.state.bookingID = 0
          me.$store.state.seat = ''
          me.$store.state.promptCancelStatus = false
          document.body.classList.remove('no_scroll')
        }
      }
    }
  }
</script>
