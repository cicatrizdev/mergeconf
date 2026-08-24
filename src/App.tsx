import { useState } from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import { CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MinhaAgendaDrawer } from './components/MinhaAgendaDrawer'
import { Grade } from './pages/Grade'
import { PalestraDetalhe } from './pages/PalestraDetalhe'
import { CheckIn } from './pages/CheckIn'
import { Organizador } from './pages/Organizador'

const linkClasse = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition-colors ${isActive ? 'text-conf' : 'text-zinc-600 hover:text-zinc-900'}`

export default function App() {
  const [agendaAberta, setAgendaAberta] = useState(false)

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-6 px-4">
          <NavLink to="/" className="text-lg font-bold tracking-tight">
            Merge<span className="text-conf">Conf</span>
          </NavLink>
          <nav className="flex items-center gap-4">
            <NavLink to="/" className={linkClasse} end>
              Grade
            </NavLink>
            <NavLink to="/checkin" className={linkClasse}>
              Check-in
            </NavLink>
            <NavLink to="/organizador" className={linkClasse}>
              Organizador
            </NavLink>
          </nav>
          <Button
            variant="outline"
            className="ml-auto"
            onClick={() => setAgendaAberta((aberta) => !aberta)}
          >
            <CalendarDays className="size-4" aria-hidden />
            Minha Agenda
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Routes>
          <Route path="/" element={<Grade />} />
          <Route path="/palestra/:id" element={<PalestraDetalhe />} />
          <Route path="/checkin" element={<CheckIn />} />
          <Route path="/organizador" element={<Organizador />} />
        </Routes>
      </main>

      <MinhaAgendaDrawer aberto={agendaAberta} onFechar={() => setAgendaAberta(false)} />
    </div>
  )
}
