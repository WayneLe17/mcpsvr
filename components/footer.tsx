export default function Footer() {
    return (
        <footer className="flex w-full flex-col border-t mt-6">
            <div className="mx-auto w-full max-w-7xl py-6 md:flex md:items-center md:justify-between">
                <div className="flex flex-col items-center justify-center gap-2 md:order-2 md:items-end"></div>
                <div className="mt-4 md:order-1 md:mt-0">
                    <div className="flex items-center justify-center gap-3 md:justify-start mb-1">
                        <div className="flex items-center">
                            <div className="flex items-center justify-center w-7 h-7 bg-primary text-primary-foreground rounded -mt-1">
                                <span className="text-xs font-bold">RL</span>
                            </div>
                            <span className="text-small font-medium ml-2">
                                Renn Labs
                            </span>
                        </div>
                        <div className="border-r h-3">&nbsp;</div>
                        {/* <span className="border-none px-0 text-default-500">
                            <span className="tint-color">●</span>&nbsp;
                            <a href="https://5ire.app" target="_blank" className="font-normal">Go with the 5ire MCP Client.</a>
                        </span> */}
                    </div>
                    <p className="text-center text-tiny text-muted-foreground md:text-start">
                        Copyright © 2025 Renn Labs | Powered by Renn Labs
                    </p>
                </div>
            </div>
        </footer>
    )
}
