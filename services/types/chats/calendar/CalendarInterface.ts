

/**]
 * 
 */
interface CalendarRequest {
    start_date: string,
    end_date: string,
    title: string,
    description: string
}

interface CalendarResponse {
    _id: string,
    sender: {
        role: string,
        uid: string,
        name: string,
        email: string
    },   
    invitee: {
        name: string,
        uid: string,
        role: string,
        email: string,
    },
    start_date: string,
    end_date: string,
    title: string,
    description: string,
}