'use client'
import { useState } from "react"

const BookEvent = () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault;

        setTimeout(() => {
            setSubmitted(true);
        }, 1000);
    }
  return (
    <div id="book-event">
        {submitted ? (
            <p>Thank you for signing up!</p>
        ) : (
            <form onSubmit={handleSubmit}>
                <label htmlFor="email">Email Address</label>
                <input 
                    type="text"
                    value={email}
                    onChange={(e)=>setEmail(e.target.value)}
                    id="email"
                    placeholder="Enter your email address"
                />
            </form>
        )}
    </div>
  )
}

export default BookEvent