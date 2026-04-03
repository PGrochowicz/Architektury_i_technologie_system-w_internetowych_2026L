import Typography from '@mui/material/Typography'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Box from '@mui/material/Box'
import { useThemeId, type ThemeId } from '../../Contexts/Theme'

export const MenuThemeSelector = () => {
    const { themeId, setThemeId } = useThemeId()

    const onChange = (
        _event: React.MouseEvent<HTMLElement>,
        value: ThemeId
    ) => setThemeId(value)

    return (
        <Box>
            <Typography component="span" sx={{ mr: 1, verticalAlign: 'middle' }}>
                Motyw
            </Typography>
            <ToggleButtonGroup
                value={themeId}
                exclusive
                onChange={onChange}
                size="small"
            >
                <ToggleButton value="light">Jasny</ToggleButton>
                <ToggleButton value="dark">Ciemny</ToggleButton>
                <ToggleButton value="high-contrast">Wysoki kontrast</ToggleButton>
            </ToggleButtonGroup>
        </Box>
    )
}
