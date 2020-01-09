import Vuex from 'vuex'

const createStore = () => {
    return new Vuex.Store({
        state: () => ({
            disableBookerUI: false,
            classPackageID: 0,
            compID: 0,
            bookingID: 0,
            scheduleID: 0,
            seatID: 0,
            customerPackageStatus: false,
            removeAssignStatus: false,
            assignStatus: false,
            changeStudioStatus: false,
            calendarDuplicateStatus: false,
            calendarClearStatus: false,
            customerCreditQuickSaleStatus: false,
            customerProductQuickSaleStatus: false,
            customerPendingQuickSaleStatus: false,
            quickSaleStatus: false,
            successfulStatus: false,
            successfulLaterStatus: false,
            promptPromoStatus: false,
            promptSwitchSeatStatus: false,
            promptSignOutStatus: false,
            promptBookerStatus: false,
            promptBookerActionStatus: false,
            promptValidateStatus: false,
            promptStatus: false,
            importStatus: false,
            resetSuccessfulStatus: false,
            resetStatus: false,
            deleteStatus: false,
            deleteImageStatus: false,
            errorStatus: false,
            errorList: [],
            confirmStatus: false,
            variantImageForm: false,
            categoryForm: false,
            userForm: false,
            roleForm: false,
            hiddenMobile: true,
            isAuth: false,
            isNotify: false,
            notificationMessage: '',
            isDeleteShow: false,
            contentLoaded: false,
            isLoading: false,
            token: '',
            customerID: 0,
            customerStoreCredit: 0,
            customer: null,
            user: {
                first_name: '',
                current_studio_id: '',
                staff_details: {
                    studio_access: [
                        {
                            studio: {}
                        }
                    ],
                    role: {
                        display_name: '',
                    }
                }
            }
        })
    })
}

export default createStore
