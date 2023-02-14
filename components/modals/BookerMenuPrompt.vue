<template>
  <div class="default_modal_side">
    <div class="background" @click.once="toggleClose()"></div>
    <div class="side_wrapper">
      <div class="side_header">
        <h2>Choose an action</h2>
      </div>
      <ul class="side_menu">
        <li
          :id="`item_${key}`"
          :class="`side_item ${item.class} ${item.toggled ? 'active' : ''}`"
          @click="toggleMenu(item, key)"
          v-if="seat.status == item.status"
          v-for="(item, key) in populateItems"
          :key="key"
        >
          <div class="item">{{ item.name }}</div>
          <svg
            id="check"
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            viewBox="0 0 30 30"
          >
            <g transform="translate(-804.833 -312)">
              <circle
                class="circle"
                cx="14"
                cy="14"
                r="14"
                transform="translate(805.833 313)"
              />
              <path
                class="mark"
                d="M6466.494,185.005l4.85,4.85,9.6-9.6"
                transform="translate(-5653.091 142.403)"
              />
            </g>
          </svg>
        </li>
        <transition name="slide">
          <span class="validation_errors" v-if="selectedMenu">
            Please select an action
          </span>
        </transition>
      </ul>
      <div
        class="form_check default"
        v-if="seat.bookings && seat.bookings.length <= 0"
      >
        <input
          type="checkbox"
          id="apply_to_all_classes"
          name="apply_to_all_classes"
          class="action_check"
          @change="$parent.apply_to_all ^= true"
        />
        <label for="apply_to_all_classes">Apply to all Classes</label>
      </div>
      <div class="button_group">
        <div class="action_cancel_btn" @click="toggleClose()">Cancel</div>
        <div
          class="action_success_btn confirm margin alternate"
          @click="toggleProceed()"
        >
          Proceed
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        selectedMenu: false,
        selectedCount: 0,
        selectedType: '',
        seat: '',
        items: [
          // {
          //     name: 'Comp',
          //     status: 'open',
          //     forPast: false,
          //     class: '',
          //     toggled: false
          // },
          {
            id: 0,
            name: 'Block',
            status: 'open',
            forPast: false,
            class: 'alt',
            toggled: false
          },
          // {
          //     name: 'Remove Comp',
          //     status: 'comp',
          //     forPast: false,
          //     class: 'alt',
          //     toggled: false
          // },
          {
            id: 1,
            name: 'Make Vacant',
            status: 'blocked',
            forPast: false,
            class: '',
            toggled: false
          },
          {
            id: 2,
            name: 'Switch Package',
            status: 'reserved',
            forPast: false,
            class: '',
            toggled: false
          },
          {
            id: 3,
            name: 'Switch Seat',
            status: 'reserved',
            forPast: false,
            class: '',
            toggled: false
          },
          {
            id: 4,
            name: 'Cancel Seat',
            status: 'reserved',
            forPast: false,
            class: 'alt',
            toggled: false
          },
          {
            id: 5,
            name: 'No Show',
            status: 'reserved',
            forPast: true,
            class: 'alt',
            toggled: false
          }
        ],
        altItems: [
          {
            id: 0,
            name: 'Block',
            status: 'open',
            forPast: false,
            class: 'alt',
            toggled: false
          },
          {
            id: 1,
            name: 'Make Vacant',
            status: 'blocked',
            forPast: false,
            class: '',
            toggled: false
          },
          {
            id: 2,
            name: 'Switch Seat',
            status: 'reserved',
            forPast: false,
            class: '',
            toggled: false
          },
          {
            id: 3,
            name: 'Cancel Seat',
            status: 'reserved',
            forPast: false,
            class: 'alt',
            toggled: false
          },
          {
            id: 4,
            name: 'No Show',
            status: 'reserved',
            forPast: true,
            class: 'alt',
            toggled: false
          }
        ]
      }
    },
    computed: {
      populateItems() {
        const me = this
        let results = []
        if (
          me.seat != '' &&
          me.$parent.customer != '' &&
          me.seat.bookings.length > 0
        ) {
          me.items.forEach((item, index) => {
            if (
              me.seat.bookings[0].original_booker_id == me.$parent.customer.id
            ) {
              if (item.status == 'reserved') {
                if (
                  me.seat.status == 'signed-in' ||
                  me.seat.status == 'reserved-guest'
                ) {
                  item.status = me.seat.status
                  if (
                    me.seat.status == 'reserved-guest' &&
                    item.name == 'Cancel Seat'
                  ) {
                    item.name = 'Cancel Guest'
                  }
                }
              }
              results.push(item)
            }
          })
        } else {
          me.altItems.forEach((item, index) => {
            if (item.status == 'reserved') {
              if (
                me.seat.status == 'signed-in' ||
                me.seat.status == 'reserved-guest'
              ) {
                item.status = me.seat.status
                if (
                  me.seat.status == 'reserved-guest' &&
                  item.name == 'Cancel Seat'
                ) {
                  item.name = 'Cancel Guest'
                }
              }
            }
            results.push(item)
          })
        }
        return results
      }
    },
    methods: {
      toggleClose() {
        const me = this
        me.$store.state.bookerMenuPromptStatus = false
        document.body.classList.remove('no_scroll')
      },
      toggleMenu(item, unique) {
        const me = this
        me.selectedMenu = false
        me.selectedCount += 1
        me.selectedType = me.convertToSlug(item.name)
        if (me.$parent.customer != '') {
          me.items.forEach((element, index) => {
            if (item.id == element.id) {
              element.toggled = true
            } else {
              element.toggled = false
            }
          })
        } else {
          me.altItems.forEach((element, index) => {
            if (item.id == element.id) {
              element.toggled = true
            } else {
              element.toggled = false
            }
          })
        }
      },
      toggleProceed() {
        const me = this
        if (me.selectedCount > 0) {
          switch (me.selectedType) {
            case 'comp':
            case 'remove-comp':
              me.$parent.assignType = 0
              if (me.seat.status == 'comp') {
                me.$store.state.removeAssignStatus = true
              } else {
                me.$store.state.assignStatus = true
              }
              break
            case 'block':
            case 'make-vacant':
              me.$parent.brokenMessage = 'Are you sure you want to continue?'
              me.$store.state.promptBrokenBikeStatus = true
              break
            case 'switch-package':
              me.$store.state.customerPackageStatus = true
              me.$store.state.customerID = me.$store.state.customerID
              me.$parent.packageMethod = 'update'
              break
            case 'switch-seat':
              me.$store.state.disableBookerUI = true
              setTimeout(() => {
                me.$parent.$refs.plan.message = 'Please select a new seat.'
              }, 10)
              me.$store.state.promptBookerStatus = true
              break
            case 'cancel-seat':
            case 'cancel-guest':
              me.$store.state.promptCancelStatus = true
              break
            case 'no-show':
              me.$parent.noShow()
              break
          }
          me.$store.state.bookerMenuPromptStatus = false
        } else {
          me.selectedMenu = true
        }
      }
    },
    mounted() {
      const me = this
      me.seat = me.$store.state.seat
    }
  }
</script>
