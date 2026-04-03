import type { ReactNode } from 'react'
import Box from '@mui/material/Box'

interface PageWrapperProps {
    children: ReactNode
}

export function PageWrapper({ children }: PageWrapperProps) {
    return (
        <Box
            component="main"
            sx={{
                flex: 1,
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
            }}
        >
            <Box
                sx={{
                    flex: 1,
                    minHeight: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                }}
            >
                {children}
            </Box>
        </Box>
    )
}
