import { Mail, Github } from 'lucide-react';
import { Separator } from '../ui/separator';
import LumpenLogo from '../ui/LumpenLogo';
import { useNavigate, Link } from 'react-router-dom';

export default function Footer() {
  const APP_VERSION = 'v2.0.0';
  const navigate = useNavigate();

  const handleWithdraw = () => {
    navigate('/user/withdrawal');
  };

  return (
    <footer className="bg-card border-t border-border mt-auto">
      {/* Main Footer Content - Hidden on mobile when bottom nav is present */}
      <div className="hidden md:block md:mb-[72px]">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* App Info */}
              <div className="">
                <div className="flex items-center gap-3">
                  <LumpenLogo size="lg" showText={true} />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {APP_VERSION}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  변화의 시작, 건강한 체중 관리
                  <br />
                  친구들과 함께하는 스마트한 솔루션
                </p>
              </div>

              {/* Contact & Info */}
              <div className="space-y-4">
                <h4 className="font-medium mt-10">정보</h4>
                <div className="space-y-4 text-sm">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>문의: a10019610@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Github className="h-4 w-4" />
                    <span>https://github.com/20220330jin/baff_be</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Bottom Bar */}
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <p>© 2025 Lumpen. All rights reserved.</p>
              </div>
              <div className="flex items-center gap-4">
                <Separator orientation="vertical" className="h-4" />
                <Link
                  to="/legal/privacy-policy"
                  className="hover:text-foreground transition-colors"
                >
                  개인정보처리방침
                </Link>
                <Separator orientation="vertical" className="h-4" />
                <Link
                  to="/legal/terms"
                  className="hover:text-foreground transition-colors"
                >
                  이용약관
                </Link>
                <Separator orientation="vertical" className="h-4" />
                <Link
                  to="/inquiry"
                  className="hover:text-foreground transition-colors"
                >
                  문의하기
                </Link>
                <Separator orientation="vertical" className="h-4" />
                <button
                  onClick={handleWithdraw}
                  className="hover:text-destructive transition-colors cursor-pointer"
                >
                  탈퇴하기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Footer - Minimal version that shows above bottom navigation */}
      <div className="md:hidden bg-muted/30 mb-16">
        <div className="container mx-auto px-4 py-4">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm">
              <LumpenLogo size="md" showText={false} />
              <span className="text-muted-foreground">{APP_VERSION}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              변화의 시작, 건강한 체중 관리 • © 2025 Lumpen
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <span>•</span>
              <Link
                to="/legal/privacy-policy"
                className="hover:text-foreground transition-colors"
              >
                개인정보처리방침
              </Link>
              <span>•</span>
              <Link
                to="/legal/terms"
                className="hover:text-foreground transition-colors"
              >
                이용약관
              </Link>
              <span>•</span>
              <Link
                to="/inquiry"
                className="hover:text-foreground transition-colors"
              >
                문의하기
              </Link>
              <span>•</span>
              <button
                onClick={handleWithdraw}
                className="hover:text-destructive transition-colors cursor-pointer"
              >
                탈퇴하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
