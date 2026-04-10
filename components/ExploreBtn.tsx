'use client';
import Image from "next/image"
import posthog from 'posthog-js'

const ExploreBtn = () => {
    function handleExploreClick() {
        posthog.capture('explore_button_clicked')
    }
    return (
        <button type="button" id="explore-btn" className="mt-7 mx-auto" onClick={handleExploreClick}>
            <a href="#events">
                Explore Events
                <Image src="/icons/arrow-down.svg" alt="arrow-down" width={25} height={24}/>
            </a>
        </button>
    )
}
export default ExploreBtn
